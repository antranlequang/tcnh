import { Comment, SupabaseComment } from '@/lib/definitions';

/**
 * Convert Supabase comment data to UI Comment format
 */
export function transformSupabaseComment(dbComment: SupabaseComment): Comment {
  return {
    id: dbComment.id,
    name: dbComment.is_anonymous ? 'Ẩn danh' : dbComment.name,
    comment: dbComment.comment,
    avatar: dbComment.is_anonymous 
      ? 'https://placehold.co/100x100/gray/white?text=?' 
      : (dbComment.avatar || 'https://placehold.co/100x100.png'),
    isAnonymous: dbComment.is_anonymous,
    createdAt: dbComment.created_at,
    parentId: dbComment.parent_id,
    replies: [],
  };
}

/**
 * Build a tree structure from flat comments array
 */
export function buildTree(flatComments: SupabaseComment[]): Comment[] {
  const transformed = flatComments.map(transformSupabaseComment);
  const commentMap = new Map<string, Comment>();
  const rootComments: Comment[] = [];

  // First pass: create the comment map
  transformed.forEach(comment => {
    commentMap.set(comment.id, comment);
  });

  // Second pass: build the tree
  transformed.forEach(comment => {
    if (comment.parentId) {
      const parent = commentMap.get(comment.parentId);
      if (parent) {
        if (!parent.replies) {
          parent.replies = [];
        }
        parent.replies.push(comment);
      }
    } else {
      rootComments.push(comment);
    }
  });

  // Sort root comments by newest first
  rootComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Sort replies by oldest first (chronological order)
  const sortReplies = (comments: Comment[]) => {
    comments.forEach(comment => {
      if (comment.replies && comment.replies.length > 0) {
        comment.replies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        sortReplies(comment.replies);
      }
    });
  };

  sortReplies(rootComments);

  return rootComments;
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays} ngày trước`;
  } else if (diffHours > 0) {
    return `${diffHours} giờ trước`;
  } else {
    return 'Vừa xong';
  }
}