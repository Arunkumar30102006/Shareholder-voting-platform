-- Fix votes.casting_shareholder_id foreign key constraint to cascade on shareholder deletion
DO $$
BEGIN
    -- Drop the existing constraint if it exists
    IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'votes_casting_shareholder_id_fkey'
          AND table_name = 'votes'
    ) THEN
        ALTER TABLE public.votes DROP CONSTRAINT votes_casting_shareholder_id_fkey;
    END IF;

    -- Re-add with ON DELETE CASCADE
    ALTER TABLE public.votes
        ADD CONSTRAINT votes_casting_shareholder_id_fkey
        FOREIGN KEY (casting_shareholder_id)
        REFERENCES public.shareholders(id)
        ON DELETE CASCADE;
END $$;

