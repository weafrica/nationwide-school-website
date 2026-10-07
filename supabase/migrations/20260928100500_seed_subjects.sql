-- The standard subject list for each grade, matching what the Academics
-- page says the school teaches. This is curriculum data only -- no
-- people. Safe to re-run: existing rows are skipped.
--
-- Grade 10-12 electives are deliberately not listed, because which
-- electives the school actually offers is the school's decision. Add
-- them as needed, e.g.
--   insert into public.subjects (name, grade, auto_enroll)
--   values ('Physical Sciences', 'Grade 10', false);
-- Mathematical Literacy is listed but not auto-enrolled, because a
-- learner takes it instead of Mathematics.

with catalogue (min_grade, max_grade, name, auto_enroll) as (
  values
    (0, 3, 'Home Language', true),
    (0, 3, 'First Additional Language', true),
    (0, 3, 'Mathematics', true),
    (0, 3, 'Life Skills', true),

    (4, 6, 'Home Language', true),
    (4, 6, 'First Additional Language', true),
    (4, 6, 'Mathematics', true),
    (4, 6, 'Natural Sciences and Technology', true),
    (4, 6, 'Social Sciences', true),
    (4, 6, 'Life Skills', true),

    (7, 9, 'Home Language', true),
    (7, 9, 'First Additional Language', true),
    (7, 9, 'Mathematics', true),
    (7, 9, 'Natural Sciences', true),
    (7, 9, 'Social Sciences', true),
    (7, 9, 'Technology', true),
    (7, 9, 'Economic and Management Sciences', true),
    (7, 9, 'Life Orientation', true),
    (7, 9, 'Creative Arts', true),

    (10, 12, 'Home Language', true),
    (10, 12, 'First Additional Language', true),
    (10, 12, 'Mathematics', true),
    (10, 12, 'Life Orientation', true),
    (10, 12, 'Mathematical Literacy', false)
)
insert into public.subjects (name, grade, auto_enroll)
select c.name, 'Grade ' || g, c.auto_enroll
from catalogue c
cross join lateral generate_series(c.min_grade, c.max_grade) as g
on conflict (name, grade) do nothing;
