-- Create user_preferences table for storing user cause preferences
CREATE TABLE IF NOT EXISTS "public"."user_preferences" (
    "user_id" "uuid" NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    "preferred_cause_slugs" "text"[] DEFAULT '{}'::text[] NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    PRIMARY KEY ("user_id")
);

-- Add RLS policies for user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own preferences" 
ON public.user_preferences FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" 
ON public.user_preferences FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
ON public.user_preferences FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create function to get user preferences
CREATE OR REPLACE FUNCTION get_user_preferences(user_uuid uuid)
RETURNS text[] AS $$
BEGIN
  RETURN (
    SELECT preferred_cause_slugs 
    FROM user_preferences 
    WHERE user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to set user preferences
CREATE OR REPLACE FUNCTION set_user_preferences(user_uuid uuid, cause_slugs text[])
RETURNS void AS $$
BEGIN
  INSERT INTO user_preferences (user_id, preferred_cause_slugs, updated_at)
  VALUES (user_uuid, cause_slugs, now())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    preferred_cause_slugs = EXCLUDED.preferred_cause_slugs,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 