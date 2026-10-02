CREATE TABLE IF NOT EXISTS questions (
  id           SERIAL PRIMARY KEY,
  sprint       INT  NOT NULL CHECK (sprint BETWEEN 1 AND 99),
  day          INT  NOT NULL CHECK (day BETWEEN 1 AND 7),   -- 1 = Wednesday ... 7 = Tuesday
  position     INT  NOT NULL,
  title        TEXT NOT NULL,
  topic        TEXT NOT NULL,                               -- DSA, SQL, OOP, OS, CN, LLD, DBMS
  lc_url       TEXT,                                        -- direct LeetCode link (optional)
  gfg_url      TEXT,                                        -- direct GeeksforGeeks link (optional)
  yt_url       TEXT,                                        -- direct YouTube link (optional)
  completed    BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  bookmarked   BOOLEAN NOT NULL DEFAULT FALSE,
  notes        TEXT NOT NULL DEFAULT '',
  is_custom    BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_questions_sd ON questions (sprint, day, position);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
