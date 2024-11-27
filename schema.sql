-- RSS源配置表
CREATE TABLE IF NOT EXISTS rss_sources (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    source_type VARCHAR(20) NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 添加 last_update 列
ALTER TABLE rss_sources 
ADD COLUMN IF NOT EXISTS last_update TIMESTAMP WITH TIME ZONE;

-- RSS文章表
CREATE TABLE IF NOT EXISTS rss_articles (
    id SERIAL PRIMARY KEY,
    source_id INTEGER REFERENCES rss_sources(id),
    title TEXT NOT NULL,
    link TEXT NOT NULL,
    description TEXT,
    pub_date TIMESTAMP WITH TIME ZONE,
    author VARCHAR(100),
    ai_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(link)
);

-- 添加系统设置表
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(50) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
