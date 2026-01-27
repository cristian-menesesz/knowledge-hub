-- Migration: Create content type-specific tables
-- Date: 2026-01-27
-- Description: Creates specialized tables for Articles, Code Snippets, Definitions, and Guides
--              Each extends the base 'contents' table with type-specific fields

-- ============================================================================
-- Article Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS articles (
    -- Inherits all columns from contents table
    id UUID PRIMARY KEY REFERENCES contents(id) ON DELETE CASCADE,
    
    -- Article-specific content
    introduction TEXT,
    body JSONB, -- Block-based content structure from editor
    conclusion TEXT,
    table_of_contents JSONB, -- [{level, title, anchor}]
    
    -- Article metadata
    reading_time INTEGER, -- in minutes
    word_count INTEGER,
    key_takeaways TEXT[], -- Array of key points
    prerequisites TEXT[], -- Array of prerequisite content slugs
    related_content_ids UUID[], -- Array of related content UUIDs
    
    -- Learning path
    learning_path VARCHAR(255),
    sequence_number INTEGER,
    
    -- Series information
    series_name VARCHAR(255),
    series_part INTEGER,
    series_total INTEGER,
    
    -- External resources
    external_resources JSONB -- [{title, url, type}]
);

-- Indexes for articles
CREATE INDEX IF NOT EXISTS idx_articles_reading_time ON articles(reading_time);
CREATE INDEX IF NOT EXISTS idx_articles_word_count ON articles(word_count);
CREATE INDEX IF NOT EXISTS idx_articles_learning_path ON articles(learning_path);
CREATE INDEX IF NOT EXISTS idx_articles_series_name ON articles(series_name);

-- Comments for articles table
COMMENT ON TABLE articles IS 'Long-form educational content with structured sections';
COMMENT ON COLUMN articles.body IS 'Block-based content structure from block editor (EditorJS/Lexical format)';
COMMENT ON COLUMN articles.table_of_contents IS 'Auto-generated or manually created table of contents';
COMMENT ON COLUMN articles.reading_time IS 'Estimated reading time in minutes';
COMMENT ON COLUMN articles.word_count IS 'Total word count of article body';

-- ============================================================================
-- Code Snippet Table
-- ============================================================================
CREATE TYPE programming_language AS ENUM (
    'javascript', 'typescript', 'python', 'java', 'go', 'rust',
    'cpp', 'csharp', 'php', 'ruby', 'swift', 'kotlin',
    'sql', 'html', 'css', 'shell', 'yaml', 'json', 'other'
);

CREATE TABLE IF NOT EXISTS code_snippets (
    -- Inherits all columns from contents table
    id UUID PRIMARY KEY REFERENCES contents(id) ON DELETE CASCADE,
    
    -- Code content
    code TEXT NOT NULL,
    language programming_language NOT NULL DEFAULT 'javascript',
    framework VARCHAR(100),
    version VARCHAR(100),
    
    -- Context
    explanation TEXT,
    use_case TEXT,
    use_cases TEXT[],
    
    -- Execution details
    output_example TEXT,
    dependencies TEXT[], -- e.g., ['lodash@4.17.21']
    setup_instructions TEXT,
    is_executable BOOLEAN DEFAULT FALSE,
    
    -- Code quality
    lines_of_code INTEGER,
    best_practices TEXT[],
    common_pitfalls TEXT[],
    
    -- Alternatives and variations
    variations JSONB, -- [{title, code, description}]
    alternative_approaches TEXT[], -- UUIDs of alternative snippets
    
    -- Performance
    time_complexity VARCHAR(50), -- e.g., 'O(n)'
    space_complexity VARCHAR(50),
    
    -- Integration
    related_snippets UUID[]
);

-- Indexes for code_snippets
CREATE INDEX IF NOT EXISTS idx_code_snippets_language ON code_snippets(language);
CREATE INDEX IF NOT EXISTS idx_code_snippets_framework ON code_snippets(framework);
CREATE INDEX IF NOT EXISTS idx_code_snippets_is_executable ON code_snippets(is_executable);

-- Comments for code_snippets table
COMMENT ON TABLE code_snippets IS 'Reusable code examples with syntax highlighting and detailed explanations';
COMMENT ON COLUMN code_snippets.code IS 'The actual code snippet';
COMMENT ON COLUMN code_snippets.is_executable IS 'Whether snippet can be run in playground';
COMMENT ON COLUMN code_snippets.time_complexity IS 'Big O notation for time complexity';

-- ============================================================================
-- Definition Table
-- ============================================================================
CREATE TYPE definition_type AS ENUM (
    'concept', 'term', 'acronym', 'api', 'pattern', 'principle'
);

CREATE TABLE IF NOT EXISTS definitions (
    -- Inherits all columns from contents table
    id UUID PRIMARY KEY REFERENCES contents(id) ON DELETE CASCADE,
    
    -- Core definition
    term VARCHAR(255) UNIQUE NOT NULL,
    definition TEXT NOT NULL,
    definition_type definition_type DEFAULT 'term',
    expanded_explanation TEXT,
    
    -- Context
    domain VARCHAR(100), -- e.g., 'Programming', 'Web Development'
    contexts TEXT[], -- Different contexts where term is used
    
    -- Acronym-specific
    full_form VARCHAR(255), -- For acronyms
    abbreviations TEXT[],
    
    -- Examples
    examples JSONB, -- [{context, example, explanation}]
    code_examples JSONB, -- [{language, code, description}]
    
    -- Cross-references
    synonyms TEXT[],
    antonyms TEXT[],
    related_terms TEXT[], -- Other definition slugs
    parent_concepts TEXT[], -- Broader concepts
    child_concepts TEXT[], -- More specific concepts
    
    -- Historical context
    etymology TEXT,
    first_used VARCHAR(255),
    
    -- Usage notes
    common_misconceptions TEXT,
    usage_notes TEXT,
    industry_variants TEXT[],
    
    -- Visual aids
    diagram_url VARCHAR(500),
    illustration_url VARCHAR(500),
    
    -- Pronunciation
    pronunciation VARCHAR(255), -- IPA notation
    audio_url VARCHAR(500)
);

-- Indexes for definitions
CREATE INDEX IF NOT EXISTS idx_definitions_term ON definitions(term);
CREATE INDEX IF NOT EXISTS idx_definitions_type ON definitions(definition_type);
CREATE INDEX IF NOT EXISTS idx_definitions_domain ON definitions(domain);
CREATE INDEX IF NOT EXISTS idx_definitions_term_search ON definitions USING gin(to_tsvector('english', term || ' ' || definition));

-- Comments for definitions table
COMMENT ON TABLE definitions IS 'Concise explanations of terms, concepts, and acronyms';
COMMENT ON COLUMN definitions.term IS 'The term being defined (unique, searchable)';
COMMENT ON COLUMN definitions.definition IS 'Concise definition (1-3 sentences)';
COMMENT ON COLUMN definitions.full_form IS 'Full form for acronyms (e.g., API → Application Programming Interface)';

-- ============================================================================
-- Guide Table
-- ============================================================================
CREATE TYPE guide_type AS ENUM (
    'tutorial', 'how-to', 'reference', 'quick-start',
    'troubleshooting', 'best-practices', 'migration'
);

CREATE TYPE guide_format AS ENUM (
    'step-by-step', 'checklist', 'decision-tree',
    'comparison', 'reference-sheet'
);

CREATE TABLE IF NOT EXISTS guides (
    -- Inherits all columns from contents table
    id UUID PRIMARY KEY REFERENCES contents(id) ON DELETE CASCADE,
    
    -- Guide classification
    guide_type guide_type DEFAULT 'reference',
    guide_format guide_format DEFAULT 'step-by-step',
    technology VARCHAR(100),
    technology_version VARCHAR(100),
    
    -- Content structure
    overview TEXT,
    steps JSONB, -- [{order, title, description, code, language, expectedOutput, troubleshooting, timeEstimate}]
    sections JSONB, -- [{title, content, order}]
    
    -- Prerequisites and requirements
    prerequisites JSONB, -- [{type, name, description, required, link}]
    required_tools TEXT[],
    system_requirements TEXT[],
    
    -- Time and effort
    estimated_time INTEGER, -- in minutes
    skill_level VARCHAR(50),
    
    -- Outcomes
    learning_outcomes TEXT[],
    deliverables TEXT[], -- What you'll build/create
    
    -- Reference information
    api_reference JSONB, -- [{endpoint, method, parameters, response, examples}]
    command_reference JSONB, -- [{command, description, options, examples}]
    configuration_options JSONB, -- [{name, type, default, description, required}]
    
    -- Troubleshooting
    common_issues JSONB, -- [{issue, cause, solution, code}]
    faqs JSONB, -- [{question, answer}]
    
    -- Version and updates
    guide_version VARCHAR(50),
    last_verified_at TIMESTAMP,
    version_compatibility TEXT[],
    
    -- Migrations and upgrades
    migration_from VARCHAR(100),
    migration_to VARCHAR(100),
    breaking_changes JSONB, -- [{change, impact, mitigation}]
    
    -- Additional resources
    official_docs JSONB, -- [{title, url}]
    related_guides UUID[],
    source_repository VARCHAR(500)
);

-- Indexes for guides
CREATE INDEX IF NOT EXISTS idx_guides_type ON guides(guide_type);
CREATE INDEX IF NOT EXISTS idx_guides_format ON guides(guide_format);
CREATE INDEX IF NOT EXISTS idx_guides_technology ON guides(technology);
CREATE INDEX IF NOT EXISTS idx_guides_skill_level ON guides(skill_level);
CREATE INDEX IF NOT EXISTS idx_guides_last_verified ON guides(last_verified_at);

-- Comments for guides table
COMMENT ON TABLE guides IS 'Comprehensive guides, tutorials, and how-to documentation';
COMMENT ON COLUMN guides.steps IS 'Step-by-step instructions for tutorials';
COMMENT ON COLUMN guides.estimated_time IS 'Estimated completion time in minutes';
COMMENT ON COLUMN guides.last_verified_at IS 'When guide was last tested/verified to work';

-- ============================================================================
-- Sample Data Queries (for reference)
-- ============================================================================

-- Create a sample article
-- INSERT INTO contents (title, slug, content_type, status, author_id) 
-- VALUES ('Getting Started with TypeScript', 'getting-started-typescript', 'article', 'published', 'user-uuid');

-- INSERT INTO articles (id, introduction, reading_time, word_count)
-- VALUES (
--     (SELECT id FROM contents WHERE slug = 'getting-started-typescript'),
--     'TypeScript is a typed superset of JavaScript...',
--     15,
--     3500
-- );

-- Create a sample code snippet
-- INSERT INTO contents (title, slug, content_type, status, author_id)
-- VALUES ('Fibonacci Function', 'fibonacci-function', 'code-snippet', 'published', 'user-uuid');

-- INSERT INTO code_snippets (id, code, language, explanation)
-- VALUES (
--     (SELECT id FROM contents WHERE slug = 'fibonacci-function'),
--     'function fibonacci(n) { ... }',
--     'javascript',
--     'Recursive implementation of fibonacci'
-- );

-- Create a sample definition
-- INSERT INTO contents (title, slug, content_type, status, author_id)
-- VALUES ('API Definition', 'api', 'definition', 'published', 'user-uuid');

-- INSERT INTO definitions (id, term, definition, definition_type, full_form)
-- VALUES (
--     (SELECT id FROM contents WHERE slug = 'api'),
--     'API',
--     'An interface for applications to communicate',
--     'acronym',
--     'Application Programming Interface'
-- );

-- Create a sample guide
-- INSERT INTO contents (title, slug, content_type, status, author_id)
-- VALUES ('Docker Installation Guide', 'docker-install', 'guide', 'published', 'user-uuid');

-- INSERT INTO guides (id, guide_type, guide_format, technology, estimated_time)
-- VALUES (
--     (SELECT id FROM contents WHERE slug = 'docker-install'),
--     'tutorial',
--     'step-by-step',
--     'Docker',
--     60
-- );
