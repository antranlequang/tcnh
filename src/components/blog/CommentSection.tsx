"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFormState } from 'react-dom';
import { useEffect, useState, useOptimistic } from 'react';
import { z } from 'zod';
import { useToast } from "@/hooks/use-toast";
import { submitComment } from '@/app/actions';
import { CommentFormSchema, type Comment, type CommentFormState } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const initialComments: Comment[] = [
  { id: 1, name: 'Alex Johnson', comment: 'Tổng quan tuyệt vời về các phòng ban! Rất hữu ích.', avatar: 'https://placehold.co/100x100.png' },
  { id: 2, name: 'Maria Garcia', comment: 'Các hoạt động có vẻ rất vui. Tôi ước gì mình có thể tham gia!', avatar: 'https://placehold.co/100x100.png' },
];

const initialState: CommentFormState = null;

export function CommentSection() {
  const { toast } = useToast();
  const [state, formAction] = useFormState(submitComment, initialState);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [optimisticComments, addOptimisticComment] = useOptimistic<Comment[], Omit<Comment, 'id' | 'avatar'>>(
    comments,
    (state, newComment) => [
      { id: Math.random(), avatar: 'https://placehold.co/100x100.png', ...newComment },
      ...state,
    ]
  );
  
  const form = useForm<z.infer<typeof CommentFormSchema>>({
    resolver: zodResolver(CommentFormSchema),
    defaultValues: {
      name: '',
      comment: '',
    },
  });

  useEffect(() => {
    if (state?.message) {
      if (state.isSafe) {
        toast({
          title: "Thành công!",
          description: state.message,
        });
        const newComment: Comment = {
          id: Math.random(),
          name: form.getValues('name'),
          comment: form.getValues('comment'),
          avatar: 'https://placehold.co/100x100.png',
        };
        setComments(prev => [newComment, ...prev]);
        form.reset();
      } else {
        toast({
          title: "Cảnh báo kiểm duyệt",
          description: state.reason || "Không thể đăng bình luận.",
          variant: "destructive",
        });
      }
    }
  }, [state, toast, form]);
  
  const onFormSubmit = (formData: FormData) => {
    const newCommentData = {
      name: formData.get('name') as string,
      comment: formData.get('comment') as string,
    };

    const validatedFields = CommentFormSchema.safeParse(newCommentData);
    if(validatedFields.success) {
      addOptimisticComment(newCommentData);
    }
    
    formAction(formData);
  };

  return (
    <Card className="shadow-lg">
      <CardContent className="p-6">
        <Form {...form}>
          <form action={onFormSubmit} className="space-y-4 mb-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên của bạn</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên của bạn" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bình luận của bạn</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Chia sẻ suy nghĩ của bạn..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              Đăng bình luận
            </Button>
          </form>
        </Form>
        <div className="space-y-6">
          <h4 className="text-xl font-headline font-semibold border-b pb-2">Bình luận</h4>
          {optimisticComments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <Avatar>
                <AvatarImage src={comment.avatar} alt={comment.name} data-ai-hint="person portrait" />
                <AvatarFallback>{comment.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-primary">{comment.name}</p>
                <p className="text-muted-foreground">{comment.comment}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
