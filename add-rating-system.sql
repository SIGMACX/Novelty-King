-- Add rating fields to submissions table
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS rating_sum DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3, 2) DEFAULT 0;

-- Create ratings table to track individual user ratings
CREATE TABLE IF NOT EXISTS submission_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating DECIMAL(2, 1) NOT NULL CHECK (rating >= 0 AND rating <= 5 AND (rating * 5) = FLOOR(rating * 5)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(submission_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_submission_ratings_submission_id ON submission_ratings(submission_id);
CREATE INDEX IF NOT EXISTS idx_submission_ratings_user_id ON submission_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_average_rating ON submissions(average_rating DESC);

-- Enable RLS
ALTER TABLE submission_ratings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view ratings
CREATE POLICY "Anyone can view ratings" ON submission_ratings
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert their own ratings
CREATE POLICY "Users can insert own ratings" ON submission_ratings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own ratings
CREATE POLICY "Users can update own ratings" ON submission_ratings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to update submission average rating
CREATE OR REPLACE FUNCTION update_submission_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE submissions
  SET
    rating_sum = (SELECT COALESCE(SUM(rating), 0) FROM submission_ratings WHERE submission_id = NEW.submission_id),
    rating_count = (SELECT COUNT(*) FROM submission_ratings WHERE submission_id = NEW.submission_id),
    average_rating = (SELECT COALESCE(AVG(rating), 0) FROM submission_ratings WHERE submission_id = NEW.submission_id)
  WHERE id = NEW.submission_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update submission rating on insert/update
CREATE TRIGGER update_submission_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON submission_ratings
FOR EACH ROW
EXECUTE FUNCTION update_submission_rating();

-- Function to calculate research field based on rating
CREATE OR REPLACE FUNCTION calculate_research_field(
  avg_rating DECIMAL,
  rating_cnt INTEGER
)
RETURNS TEXT AS $$
BEGIN
  IF rating_cnt > 100 AND avg_rating > 4.5 THEN
    RETURN 'king-novelty';
  ELSIF avg_rating >= 3.5 THEN
    RETURN 'significant-novelty';
  ELSIF avg_rating >= 2.5 THEN
    RETURN 'small-novelty';
  ELSE
    RETURN 'claimed-novelty';
  END IF;
END;
$$ LANGUAGE plpgsql;
