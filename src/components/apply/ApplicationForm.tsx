"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useActionState, useTransition } from 'react';
import { useEffect, useRef } from 'react';
import { z } from 'zod';
import { useToast } from "@/hooks/use-toast";
import { submitApplication } from '@/app/actions';
import { ApplicationFormSchema, type ApplicationFormState } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

const initialState: ApplicationFormState = null;

const departments = [
  "Tổ chức - Xây dựng Đoàn",
  "Tuyên giáo - Sự kiện",
  "Truyền thông - Kỹ thuật",
  "Phong trào - Tình nguyện"
];

export function ApplicationForm() {
  const { toast } = useToast();
  const [state, formAction] = useActionState(submitApplication, initialState);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<z.infer<typeof ApplicationFormSchema>>({
    resolver: zodResolver(ApplicationFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      facebookLink: '',
      portraitPhoto: undefined,
      reason: '',
      expectation: '',
      situation: '',
      department: undefined,
    },
    mode: 'onChange', // Validate khi user thay đổi input
  });

  // Hàm xử lý submit form
  const onSubmit = async (data: z.infer<typeof ApplicationFormSchema>) => {
    console.log('Form data being submitted:', data); // Debug log
    
    const formData = new FormData();
    formData.append('fullName', data.fullName);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    formData.append('facebookLink', data.facebookLink);
    if (data.portraitPhoto) {
      formData.append('portraitPhoto', data.portraitPhoto);
    }
    formData.append('reason', data.reason);
    formData.append('expectation', data.expectation);
    formData.append('situation', data.situation);
    if (data.department) {
      formData.append('department', data.department);
    }
    
    // Gọi action trong transition
    startTransition(() => {
      formAction(formData);
    });
  };

  useEffect(() => {
    if (state?.message) {
      if (state.issues && state.issues.length > 0) {
        toast({
          title: "Lỗi xác thực",
          description: state.message,
          variant: "destructive",
        });
      } else {
        const description = state.sheetUrl
          ? `${state.message} Xem sheet: ${state.sheetUrl}`
          : state.message;
        toast({
          title: "Thành công!",
          description,
        });
        if (state.analysis) {
          form.reset();
          formRef.current?.reset();
        }
      }
    }
  }, [state, toast, form]);

  return (
    <div>
        <Form {...form}>
            <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Họ và Tên *</FormLabel>
                        <FormControl><Input placeholder="Trần Lê Quang An" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl><Input type="email" placeholder="antlq22414@st.uel.edu.vn" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Số điện thoại *</FormLabel>
                            <FormControl><Input type="tel" placeholder="0123456789" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="facebookLink" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Link Facebook *</FormLabel>
                            <FormControl><Input placeholder="https://facebook.com/quangancuteboiz" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>

                {/* <FormField control={form.control} name="portraitPhoto" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Ảnh chân dung (Rõ mặt) - Tùy chọn</FormLabel>
                        <FormControl>
                            <Input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        // Kiểm tra kích thước file
                                        if (file.size > 5 * 1024 * 1024) {
                                            form.setError('portraitPhoto', { 
                                                message: 'Kích thước ảnh tối đa là 5MB.' 
                                            });
                                            return;
                                        }
                                        // Kiểm tra định dạng file
                                        const acceptedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
                                        if (!acceptedTypes.includes(file.type)) {
                                            form.setError('portraitPhoto', { 
                                                message: 'Chỉ chấp nhận ảnh định dạng .jpg, .jpeg, .png và .webp.' 
                                            });
                                            return;
                                        }
                                        field.onChange(file);
                                        form.clearErrors('portraitPhoto');
                                    }
                                }}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} /> */}

                <FormField control={form.control} name="reason" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tại sao bạn muốn ứng tuyển vào Đoàn khoa Tài chính - Ngân hàng? *</FormLabel>
                        <FormControl><Textarea rows={4} placeholder="Chia sẻ lý do của bạn..." {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="expectation" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Bạn mong muốn điều gì khi tham gia cùng chúng tớ? *</FormLabel>
                        <FormControl><Textarea rows={4} placeholder="Kỳ vọng của bạn..." {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="situation" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Câu hỏi tình huống: "Nếu được giao một nhiệm vụ không thuộc chuyên môn của mình, bạn sẽ làm gì?" *</FormLabel>
                        <FormControl><Textarea rows={4} placeholder="Cách bạn xử lý tình huống..." {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="department" render={({ field }) => (
                    <FormItem className="space-y-3">
                        <FormLabel>Bạn muốn ứng tuyển vào Ban chuyên môn nào? *</FormLabel>
                        <FormControl>
                            <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="flex flex-col space-y-1"
                            >
                                {departments.map(dept => (
                                    <FormItem key={dept} className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value={dept} />
                                        </FormControl>
                                        <FormLabel className="font-normal">{dept}</FormLabel>
                                    </FormItem>
                                ))}
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <div className="flex justify-end">
                    <Button type="submit" size="lg" disabled={form.formState.isSubmitting || isPending}>
                        {(form.formState.isSubmitting || isPending) ? 'Đang gửi...' : 'Submit'}
                    </Button>
                </div>
            </form>
        </Form>
        
        {state?.analysis && (
             <Alert className="mt-8 text-center">
                CHÚC BẠN MỘT NGÀY TỐT LÀNH!
                {/* <Terminal className="h-4 w-4" />
                <AlertTitle>Phân tích AI sơ bộ</AlertTitle>
                <AlertDescription>
                    <p className="font-mono text-sm">{state.analysis}</p>
                </AlertDescription> */}
            </Alert>
        )}
        
        {state?.issues && state.issues.length > 0 && (
            <Alert className="mt-8" variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Lỗi xác thực</AlertTitle>
                <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                        {state.issues.map((issue, index) => (
                            <li key={index} className="font-mono text-sm">{issue}</li>
                        ))}
                    </ul>
                </AlertDescription>
            </Alert>
        )}
    </div>
  );
}
