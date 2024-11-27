import { Input, Card, Button, Pagination, message, Spin, Empty } from 'antd';
import { SearchOutlined, CopyOutlined, PlusOutlined, CheckOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import type { Article } from '../types/article';

const MainContent = styled.div`
  padding: 20px;
  height: 100%;
  overflow-y: auto;
`;

const SearchHeader = styled.div`
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const SearchContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;

  .back-button {
    border: none;
    padding: 0 8px;
    height: 40px;
    
    &:hover {
      color: #1890ff;
      background: transparent;
    }
  }

  .search-input {
    flex: 1;
    max-width: 600px;

    .ant-input-affix-wrapper {
      border-radius: 8px;
      height: 40px;
      padding: 4px 11px;
      transition: all 0.3s;
      border: 1px solid #d9d9d9;
      box-shadow: 0 2px 0 rgba(0, 0, 0, 0.02);

      &:hover, &:focus {
        border-color: #40a9ff;
        box-shadow: 0 2px 0 rgba(24, 144, 255, 0.1);
      }

      .anticon {
        color: #bfbfbf;
      }
    }

    input {
      font-size: 15px;

      &::placeholder {
        color: #bfbfbf;
      }
    }
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
`;

interface StyledResultsContainerProps {
  isLoading: boolean;
}

const ResultsContainer = styled.div<StyledResultsContainerProps>`
  max-width: 1200px;
  margin: 0 auto;
  opacity: ${props => props.isLoading ? 0.5 : 1};
  transition: opacity 0.3s;
  pointer-events: ${props => props.isLoading ? 'none' : 'auto'};
  padding: 0 16px;
`;

const ArticleCard = styled(Card)`
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  }

  .ant-card-body {
    padding: 24px;
    height: 280px;
    display: flex;
    flex-direction: column;
  }
`;

const Title = styled.a`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: #1890ff;
  
  &:hover {
    color: #40a9ff;
    text-decoration: underline;
  }

  mark {
    background-color: #ffe58f;
    padding: 0 2px;
    border-radius: 2px;
  }
`;

const Summary = styled.div`
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 16px;
  flex-grow: 1;
  line-height: 1.6;
  color: #595959;
  font-size: 14px;

  mark {
    background-color: #ffe58f;
    padding: 0 2px;
    border-radius: 2px;
  }
`;

const MetaInfo = styled.div`
  color: #8c8c8c;
  font-size: 13px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 16px;

  .dot {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background-color: #d9d9d9;
  }
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;

  .copy-btn, .add-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    height: 32px;
    border-radius: 6px;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-1px);
    }
  }

  .add-btn {
    &.added {
      background-color: #f6ffed;
      border-color: #b7eb8f;
      color: #52c41a;

      &:hover {
        background-color: #f6ffed;
        border-color: #95de64;
        color: #52c41a;
      }
    }
  }
`;

interface SearchViewProps {
  articles: Article[];
  loading: boolean;
  searchQuery: string;
  onSearch: (value: string) => void;
  onExit: () => void;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  selectedArticles: Article[];
  onAddToSummary: (article: Article) => void;
}

export default function SearchView({
  articles,
  loading,
  searchQuery,
  onSearch,
  onExit,
  page,
  pageSize,
  total,
  onPageChange,
  selectedArticles,
  onAddToSummary
}: SearchViewProps) {
  const handleCopy = (article: Article) => {
    const content = `${article.title}\n\n${article.ai_summary}\n\n发布时间：${new Date(article.pub_date).toLocaleString()}\n来源：${article.source_name}`;
    navigator.clipboard.writeText(content);
    message.success('已复制到剪贴板');
  };

  const renderContent = () => {
    if (!searchQuery) {
      return (
        <LoadingContainer>
          <Empty description="请输入搜索关键词" />
        </LoadingContainer>
      );
    }

    if (loading) {
      return (
        <LoadingContainer>
          <Spin size="large" tip="搜索中..." />
        </LoadingContainer>
      );
    }

    if (articles.length === 0) {
      return (
        <LoadingContainer>
          <Empty description="未找到相关文章" />
        </LoadingContainer>
      );
    }

    return (
      <ResultsContainer isLoading={loading}>
        {articles.map(article => (
          <ArticleCard key={article.id}>
            <Title 
              href={article.link} 
              target="_blank" 
              rel="noopener noreferrer"
              dangerouslySetInnerHTML={{ __html: article.title }}
            />
            <Summary dangerouslySetInnerHTML={{ __html: article.ai_summary }} />
            <MetaInfo>
              {new Date(article.pub_date).toLocaleString()} · {article.source_name} · {article.category}
            </MetaInfo>
            <ActionBar>
              <Button 
                icon={<CopyOutlined />} 
                onClick={() => handleCopy(article)}
              >
                一键复制
              </Button>
              <Button
                icon={selectedArticles.some(a => a.id === article.id) ? <CheckOutlined /> : <PlusOutlined />}
                onClick={() => onAddToSummary(article)}
                disabled={selectedArticles.some(a => a.id === article.id)}
              >
                {selectedArticles.some(a => a.id === article.id) ? '已加入' : '加入AI总结'}
              </Button>
            </ActionBar>
          </ArticleCard>
        ))}

        {total > 0 && (
          <Pagination
            current={page}
            total={total}
            pageSize={pageSize}
            onChange={onPageChange}
            showSizeChanger={false}
            showQuickJumper
          />
        )}
      </ResultsContainer>
    );
  };

  return (
    <MainContent>
      <SearchHeader>
        <SearchContainer>
          <Button 
            className="back-button"
            icon={<ArrowLeftOutlined />} 
            onClick={onExit}
          >
            返回
          </Button>
          <Input
            className="search-input"
            placeholder="输入搜索关键词"
            value={searchQuery}
            prefix={<SearchOutlined />}
            onChange={(e) => onSearch(e.target.value)}
            onPressEnter={(e) => onSearch(e.currentTarget.value)}
          />
        </SearchContainer>
      </SearchHeader>

      {renderContent()}
    </MainContent>
  );
} 