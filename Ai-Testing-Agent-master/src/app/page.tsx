'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Rocket, Lightbulb, Globe, Loader2, Bot, FileText, Activity } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { runTest } from './actions';
import type { Report } from './actions';

const formSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL.' }),
  prompt: z.string().min(10, { message: 'Prompt must be at least 10 characters long.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function Home() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [report, setReport] = React.useState<Report | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: '',
      prompt: '',
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setReport(null);
    
    const result = await runTest(values);

    if (result.success && result.data) {
      setReport(result.data);
      form.reset();
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'An unknown error occurred.',
      });
    }
    
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 selection:bg-primary/20">
      <div className="w-full max-w-3xl space-y-8">
        <header className="text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <Bot className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight text-foreground">AI Test Pilot</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Your intelligent partner for automated web testing.
          </p>
        </header>

        <main>
          <Card className="shadow-lg">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Lightbulb className="h-6 w-6 text-accent" />
                    Start a New Test
                  </CardTitle>
                  <CardDescription>
                    Provide a URL and a prompt to generate and run tests automatically.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 font-semibold">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          Website URL
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="prompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 font-semibold">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          Testing Prompt
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., 'Test the login functionality with a valid and an invalid user...'"
                            className="min-h-[120px] resize-y"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-end bg-muted/50 p-4 rounded-b-lg">
                  <Button type="submit" disabled={isLoading} size="lg">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Rocket className="mr-2 h-5 w-5" />
                        Run Test
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </main>
        
        {isLoading && (
          <Card className="shadow-lg">
            <CardHeader>
              <Skeleton className="h-7 w-48 rounded-md" />
              <Skeleton className="h-4 w-full mt-2 rounded-md" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Skeleton className="h-6 w-32 mb-2 rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-5/6 mt-2 rounded-md" />
              </div>
              <Separator />
              <div>
                <Skeleton className="h-6 w-48 mb-2 rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-full mt-2 rounded-md" />
                <Skeleton className="h-4 w-2/3 mt-2 rounded-md" />
              </div>
            </CardContent>
          </Card>
        )}
        
        {report && (
          <Card className="shadow-lg animate-in fade-in-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <FileText className="h-6 w-6 text-accent" />
                Test Report
              </CardTitle>
              <CardDescription>
                Summary of the test execution and actions performed by the AI agent.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Summary
                </h3>
                <p className="text-foreground/90 whitespace-pre-wrap">{report.summary}</p>
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                  <Rocket className="h-5 w-5 text-primary" />
                  Actions Performed
                </h3>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm text-foreground/90 whitespace-pre-wrap font-mono overflow-x-auto">
                    <code>{report.actions}</code>
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <footer className="text-center text-sm text-muted-foreground pt-8">
          <p>Powered by AI Test Pilot</p>
        </footer>
      </div>
    </div>
  );
}
