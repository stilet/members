CREATE TYPE public.jwt_token AS (
  role TEXT,
  exp INTEGER,
  member_id INTEGER,
  -- is_admin BOOLEAN,
  name VARCHAR
);

CREATE FUNCTION public.authenticate(
  email TEXT,
  password TEXT
) RETURNS public.jwt_token AS $$
DECLARE
  member public.member;
BEGIN
  SELECT m.* INTO member
    FROM public.member as m
    WHERE m.email = authenticate.email;

  IF member.password = crypt(password, member.password) THEN
    RETURN (
      'person_role',
      extract(epoch from now() + interval '7 days'),
      member.id,
      -- FALSE,
      member.name
    )::public.jwt_token;
  ELSE
    RETURN NULL;
  END IF;
END;
$$ language plpgsql strict security definer;
