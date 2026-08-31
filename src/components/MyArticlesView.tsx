import React, { useState, useEffect } from 'react';
import { Article } from '../types';
import { fetchMyArticles, deleteArticle } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { PenLine, Trash2, Edit3, Eye, Clock, BookOpen, AlertTriangle } from 'lucide-react';

interface MyArticlesViewProps {
  onOpenEditor: () => void;
  onEditArticle: (article: Article) => void;
  onViewArticle: (id: string) => void;
}

export function MyArticlesView({
  onOpenEditor,
  onEditArticle,
  onViewArticle,
}: MyArticlesViewProps) {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState<Article | null>(null);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await fetchMyArticles(user.id);
      setArticles(data);
    } catch (err) {
      console.error('加载我的文章失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteModal) return;
    setDeletingId(confirmDeleteModal.id);
    try {
      await deleteArticle(confirmDeleteModal.id);
      setArticles((prev) => prev.filter((a) => a.id !== confirmDeleteModal.id));
      setConfirmDeleteModal(null);
    } catch (err: any) {
      alert(err.message || '删除失败');
    } finally {
      setDeletingId(null);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
        <p className="text-slate-600 text-sm">请先登录以查看和管理您的个人作品</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 头部面板 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">我的作品管理中心</h2>
          <p className="text-xs text-slate-500 mt-1">
            集中管理您撰写的所有公开文章与私密草稿，支持随时编辑更新或安全删除
          </p>
        </div>
        <button
          onClick={onOpenEditor}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-medium rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <PenLine className="w-4 h-4" />
          <span>撰写新文章</span>
        </button>
      </div>

      {/* 列表区域 */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white p-5 rounded-xl border border-slate-200 animate-pulse h-24" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">您目前还没有发布任何文章</h3>
          <p className="text-xs text-slate-400 mt-1 mb-5">
            点击上方按钮，立即开始撰写并发布您的第一篇大作吧！
          </p>
          <button
            onClick={onOpenEditor}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-medium hover:bg-indigo-700 cursor-pointer"
          >
            <PenLine className="w-3.5 h-3.5" />
            开始写作
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((art) => (
            <div
              key={art.id}
              className="bg-white p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                      art.isPublished
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {art.isPublished ? '已公开' : '私密草稿'}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(art.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>

                <h4 
                  onClick={() => onViewArticle(art.id)}
                  className="text-base font-bold text-slate-900 hover:text-indigo-600 cursor-pointer truncate transition-colors"
                >
                  {art.title}
                </h4>

                <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                  <span>浏览 {art.views} 次</span>
                  <span>获赞 {art.likes}</span>
                  <span>评论 {art.comments?.length || 0} 条</span>
                </div>
              </div>

              {/* 操作按钮组 */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => onViewArticle(art.id)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  查看
                </button>
                <button
                  onClick={() => onEditArticle(art)}
                  className="px-3 py-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-100 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  编辑
                </button>
                <button
                  onClick={() => setConfirmDeleteModal(art)}
                  className="px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-100 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 删除确认弹窗 */}
      {confirmDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">确认删除这篇文章吗？</h3>
              <p className="text-xs text-slate-500 mt-1">
                《{confirmDeleteModal.title}》将被永久删除且不可恢复。
              </p>
            </div>
            <div className="flex items-center gap-3 justify-center pt-2">
              <button
                onClick={() => setConfirmDeleteModal(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-medium rounded-xl hover:bg-slate-200 cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deletingId !== null}
                className="px-4 py-2 bg-rose-600 text-white text-xs font-medium rounded-xl hover:bg-rose-700 cursor-pointer"
              >
                {deletingId ? '正在删除...' : '确认彻底删除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
