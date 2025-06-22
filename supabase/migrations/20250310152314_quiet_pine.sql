/*
  # Add Database Ping Function

  1. New Functions
    - `ping`: Simple function to test database connectivity
    - Returns true if connection is successful

  2. Security
    - Function is accessible to all authenticated users
    - No sensitive data is exposed
*/

CREATE OR REPLACE FUNCTION ping()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN true;
END;
$$;