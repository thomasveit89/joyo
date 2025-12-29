-- Verify RLS policies for assets table
-- This query shows the correct columns for each policy type

SELECT
  policyname,
  cmd,
  -- For SELECT/UPDATE/DELETE policies, the USING clause is in 'qual'
  -- For INSERT policies, the WITH CHECK clause is in 'with_check'
  CASE
    WHEN cmd = 'INSERT' THEN with_check
    ELSE qual
  END as relevant_clause,
  -- Show both for debugging
  qual as using_clause_raw,
  with_check as with_check_clause_raw
FROM pg_policies
WHERE tablename = 'assets'
ORDER BY cmd, policyname;

-- Also test if the policy actually works by checking what RLS allows
-- This will show if a user can insert their own data
SELECT
  polname,
  polcmd,
  polpermissive,
  polroles::regrole[],
  pg_get_expr(polqual, polrelid) as using_expr,
  pg_get_expr(polwithcheck, polrelid) as with_check_expr
FROM pg_policy
WHERE polrelid = 'assets'::regclass
ORDER BY polcmd, polname;
