import React from 'react';
import { PRData } from '../types';
import { ExternalLink, GitPullRequest, Clock, User, Calendar } from 'lucide-react';

interface PRFeedProps {
  data: PRData[];
}

export const PRFeed: React.FC<PRFeedProps> = ({ data }) => {
  const getStateColor = (state: string) => {
    switch (state) {
      case 'open':
        return 'text-green-400 bg-green-400/10';
      case 'merged':
        return 'text-purple-400 bg-purple-400/10';
      case 'closed':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {data.map((pr) => (
        <div
          key={pr.id}
          className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors border border-gray-600"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <GitPullRequest className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <h4 className="text-white font-medium truncate">
                  #{pr.number} - {pr.title}
                </h4>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {pr.user_login}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(pr.created_at)}
                  </span>
                  {pr.merged_at && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Merged {formatDate(pr.merged_at)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStateColor(pr.state)}`}
              >
                {pr.state}
              </span>
              <a
                href={pr.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span className="bg-gray-800 px-2 py-1 rounded text-xs">
              {pr.repository}
            </span>
            
            {(pr.additions || pr.deletions || pr.changed_files) && (
              <div className="flex items-center gap-3 text-xs">
                {pr.additions && (
                  <span className="text-green-400">+{pr.additions}</span>
                )}
                {pr.deletions && (
                  <span className="text-red-400">-{pr.deletions}</span>
                )}
                {pr.changed_files && (
                  <span className="text-gray-400">{pr.changed_files} files</span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};