-- =====================================================================
-- CHUNAV SETU - SEED DATA SCRIPT (3 REALISTIC ISOLATED CAMPAIGNS)
-- =====================================================================

-- 1. CLIENT 1: Rajesh Sharma (Central Assembly Election 2026)
INSERT INTO public.clients (id, name, candidate_name, mobile, email, campaign_name, election_type, location, status)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Sharma Campaign HQ',
    'Rajesh Sharma',
    '+91 98201 12345',
    'rajesh.sharma@chunavsetu.com',
    'Central Assembly 2026',
    'Vidhan Sabha',
    'Lucknow Central (AC-174)',
    'active'
) ON CONFLICT (email) DO NOTHING;

-- 2. CLIENT 2: Priya Verma (North Ward Municipal 2026)
INSERT INTO public.clients (id, name, candidate_name, mobile, email, campaign_name, election_type, location, status)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'Verma Vikas Samiti',
    'Priya Verma',
    '+91 98450 54321',
    'priya.verma@chunavsetu.com',
    'North Ward Municipal 2026',
    'Municipal Corporation',
    'Varanasi North Ward 14',
    'active'
) ON CONFLICT (email) DO NOTHING;

-- 3. CLIENT 3: Anil Deshmukh (South Parliamentary 2026)
INSERT INTO public.clients (id, name, candidate_name, mobile, email, campaign_name, election_type, location, status)
VALUES (
    '33333333-3333-3333-3333-333333333333',
    'Deshmukh Janshakti Office',
    'Anil Deshmukh',
    '+91 97110 98765',
    'anil.deshmukh@chunavsetu.com',
    'South Parliamentary 2026',
    'Lok Sabha',
    'Pune South Constituency',
    'active'
) ON CONFLICT (email) DO NOTHING;

-- ---------------------------------------------------------------------
-- CAMPAIGNS
-- ---------------------------------------------------------------------
INSERT INTO public.campaigns (id, client_id, title, description, election_date, target_voters, status)
VALUES 
('c1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Lucknow Central Assembly Campaign 2026', 'Focus on youth employment, infrastructure, and water connectivity.', '2026-11-15', 125000, 'active'),
('c2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Varanasi Ward 14 Sanitation & Development', 'Ward level door-to-door resident engagement.', '2026-10-20', 18000, 'active'),
('c3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Pune South Vision 2026', 'Constituency-wide outreach across all legislative assembly segments.', '2026-12-05', 450000, 'active');

-- ---------------------------------------------------------------------
-- AREAS & BOOTHS FOR CLIENT 1 (Rajesh Sharma)
-- ---------------------------------------------------------------------
INSERT INTO public.areas (id, client_id, campaign_id, name, ward_number, pincode) VALUES
('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Hazratganj Main', 'Ward 08', '226001'),
('a1111111-2222-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Alambagh Market', 'Ward 12', '226005');

INSERT INTO public.booths (id, client_id, campaign_id, area_id, booth_number, booth_name, location_address, target_voter_count) VALUES
('b1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'Booth 101', 'Govt Inter College, Room 1', 'Near Capitol Cinema, Hazratganj', 1150),
('b1111111-2222-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'Booth 102', 'Govt Girls School, Room 3', 'MG Marg, Hazratganj', 980),
('b1111111-3333-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'a1111111-2222-1111-1111-111111111111', 'Booth 103', 'Alambagh Public Community Hall', 'Chander Nagar, Alambagh', 1240);

-- ---------------------------------------------------------------------
-- VOLUNTEERS FOR CLIENT 1
-- ---------------------------------------------------------------------
INSERT INTO public.volunteers (id, client_id, name, mobile, email, assigned_booth_id, assigned_area_id, status, joining_date) VALUES
('v1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Amit Kumar', '+91 99190 11223', 'amit.volunteer@chunavsetu.com', 'b1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'active', '2026-08-01'),
('v1111111-2222-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Sunita Tripathi', '+91 94150 33445', 'sunita.v@chunavsetu.com', 'b1111111-2222-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'active', '2026-08-05'),
('v1111111-3333-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Vikas Mishra', '+91 97920 55667', 'vikas.m@chunavsetu.com', 'b1111111-3333-1111-1111-111111111111', 'a1111111-2222-1111-1111-111111111111', 'active', '2026-08-10');

-- ---------------------------------------------------------------------
-- SUBSCRIPTIONS
-- ---------------------------------------------------------------------
INSERT INTO public.subscriptions (client_id, plan_name, max_voters, max_volunteers, status, valid_until) VALUES
('11111111-1111-1111-1111-111111111111', 'assembly_pro', 150000, 100, 'active', '2026-12-31 23:59:59'),
('22222222-2222-2222-2222-222222222222', 'ward_starter', 25000, 20, 'active', '2026-11-30 23:59:59'),
('33333333-3333-3333-3333-333333333333', 'parliament_enterprise', 500000, 500, 'active', '2027-01-31 23:59:59');
