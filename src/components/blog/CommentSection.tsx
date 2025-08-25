"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useActionState } from 'react';
import { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { submitComment } from '@/app/actions';
import { CommentFormSchema, type Comment, type CommentFormState, type SupabaseComment } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Reply, MessageCircle } from 'lucide-react';
import { buildTree, formatTimestamp } from "@/lib/comment-utils";
import { supabase } from "@/lib/supabaseClient";

const initialState: CommentFormState = null;

interface CommentFormProps {
  parentId?: string;
  parentAuthor?: string;
  onCancel?: () => void;
}

interface CommentItemProps {
  comment: Comment;
  onReply: (commentId: string, authorName: string) => void;
}

function CommentForm({ parentId, parentAuthor, onCancel }: CommentFormProps) {
  const { toast } = useToast();
  const [state, formAction] = useActionState(submitComment, initialState);
  
  const form = useForm({
    resolver: zodResolver(CommentFormSchema),
    defaultValues: {
      name: '',
      comment: '',
      parentId,
      isAnonymous: false,
    },
  });

  const isAnonymous = form.watch('isAnonymous');

  useEffect(() => {
    if (state?.message) {
      if (state.isSafe) {
        toast({
          title: "Thành công!",
          description: state.message,
        });
        
        // Reset form after successful submission
        form.reset({ name: '', comment: '' });
        form.setValue('isAnonymous', false);
        if (onCancel) onCancel();
      } else {
        toast({
          title: "Cảnh báo kiểm duyệt",
          description: state.reason || "Không thể đăng bình luận.",
          variant: "destructive",
        });
      }
    }
  }, [state, toast, form, onCancel]);

  const onFormSubmit = (formData: FormData) => {
    if (parentId) {
      formData.set('parentId', parentId);
    }
    formAction(formData);
  };

  return (
    <div className={parentId ? "ml-12 mt-4 border-l-2 border-gray-200 pl-4" : ""}>
      {parentId && parentAuthor && (
        <p className="text-sm text-muted-foreground mb-2">
          Trả lời <strong>{parentAuthor}</strong>
        </p>
      )}
      <Form {...form}>
        <form action={onFormSubmit} className="space-y-4">
          <input type="hidden" name="parentId" value={parentId || ''} />
          
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="isAnonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => form.setValue('isAnonymous', !!checked)}
            />
            <label htmlFor="isAnonymous" className="text-sm font-medium">
              Đăng ẩn danh
            </label>
          </div>
          <input type="hidden" name="isAnonymous" value={isAnonymous.toString()} />
          
          {!isAnonymous && (
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên của bạn</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên của bạn" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{parentId ? 'Phản hồi của bạn' : 'Bình luận của bạn'}</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder={parentId ? "Nhập phản hồi..." : "Chia sẻ suy nghĩ của bạn..."} 
                    {...field} 
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex gap-2">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {parentId ? 'Gửi phản hồi' : 'Đăng bình luận'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Hủy
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}

function CommentItem({ comment, onReply }: CommentItemProps) {
  const displayName = comment.isAnonymous ? 'Ẩn danh' : (comment.name || 'Ẩn danh');
  const avatarFallback = comment.isAnonymous ? '?' : displayName.charAt(0);

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Avatar>
          <AvatarImage 
            src={comment.avatar || 'https://placehold.co/100x100.png'} 
            alt={displayName} 
            data-ai-hint="person portrait" 
          />
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-primary">{displayName}</p>
            <span className="text-xs text-muted-foreground">
              {formatTimestamp(comment.createdAt)}
            </span>
          </div>
          <p className="text-muted-foreground mb-2">{comment.comment}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReply(comment.id, displayName)}
            className="h-8 px-2 text-xs"
          >
            <Reply className="w-3 h-3 mr-1" />
            Trả lời
          </Button>
        </div>
      </div>
      
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-12 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentSection() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyingTo, setReplyingTo] = useState<{ id: string; author: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Fetch initial comments
    const fetchComments = async () => {
      try {
        const { data, error } = await supabase
          .from("comments")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && isMounted && data) {
          const typedData = data as SupabaseComment[];
          setComments(buildTree(typedData));
        } else if (error) {
          console.error('Error fetching comments:', error);
        }
      } catch (err) {
        console.error('Error fetching comments:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchComments();

    // Set up realtime subscription
    const channel = supabase
      .channel("comments-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "comments" },
        (payload) => {
          if (!isMounted) return;
          
          // Refetch all comments to maintain proper tree structure
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const handleReply = (commentId: string, authorName: string) => {
    setReplyingTo({ id: commentId, author: authorName });
  };

  const handleCancelReply = () => setReplyingTo(null);

  return (
    <Card className="shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle className="w-5 h-5 text-primary" />
          <h4 className="text-xl font-semibold">Bình luận</h4>
        </div>

        {/* Main comment form */}
        <CommentForm />

        <div className="mt-8 space-y-6">
          <div className="border-b pb-2">
            <p className="text-sm text-muted-foreground">
              {comments.length} bình luận
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground">Đang tải bình luận...</div>
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Tụi tớ đang phát triển tính năng này trở nên xịn xịn hơn nên là bạn hãy chờ chút nha...
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id}>
                <CommentItem comment={comment} onReply={handleReply} />
                {replyingTo?.id === comment.id && (
                  <CommentForm
                    parentId={comment.id}
                    parentAuthor={replyingTo.author}
                    onCancel={handleCancelReply}
                  />
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}