import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Code2, Trophy, Briefcase, Search as SearchIcon, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface SearchResults {
  modules: Array<{
    id: string;
    title: string;
    description: string;
    careerPath: string | null;
    totalXP: number;
    requiredLevel: number;
  }>;
  quizzes: Array<{
    id: string;
    title: string;
    description: string;
    difficulty: string;
    xpReward: number;
  }>;
  challenges: Array<{
    id: string;
    title: string;
    description: string;
    difficulty: string;
    xpReward: number;
  }>;
  careerPaths: Array<{
    id: string;
    name: string;
    description: string;
    skills: string[];
  }>;
}

export default function SearchResults() {
  const search = useSearch();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const queryParam = new URLSearchParams(search).get("q") || "";
  const [activeTab, setActiveTab] = useState<"all" | "modules" | "quizzes" | "challenges" | "paths">("all");

  const { data, isLoading, error } = useQuery<{ results: SearchResults }>({
    queryKey: ["/api/search", { q: queryParam }],
    enabled: queryParam.length >= 2,
  });

  const results = data?.results;
  const totalResults = results
    ? results.modules.length + results.quizzes.length + results.challenges.length + results.careerPaths.length
    : 0;

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/dashboard")}
            className="mb-4"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <SearchIcon className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">Search Results</h1>
          </div>
          <p className="text-muted-foreground">
            {queryParam ? `Results for "${queryParam}"` : "Enter a search query"}
            {totalResults > 0 && ` • ${totalResults} results found`}
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Searching...</p>
            </div>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-destructive">Failed to search. Please try again.</p>
            </CardContent>
          </Card>
        ) : !queryParam || queryParam.length < 2 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <SearchIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Start Searching</h3>
              <p className="text-muted-foreground">
                Enter at least 2 characters to search across modules, quizzes, challenges, and career paths.
              </p>
            </CardContent>
          </Card>
        ) : totalResults === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <SearchIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
              <p className="text-muted-foreground">
                No matches found for "{queryParam}". Try different keywords or browse our modules directly.
              </p>
              <Button onClick={() => setLocation("/modules")} className="mt-4">
                Browse Modules
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="mb-6">
              <TabsTrigger value="all" data-testid="tab-all">All ({totalResults})</TabsTrigger>
              {results && results.modules.length > 0 && (
                <TabsTrigger value="modules" data-testid="tab-modules">
                  Modules ({results.modules.length})
                </TabsTrigger>
              )}
              {results && results.quizzes.length > 0 && (
                <TabsTrigger value="quizzes" data-testid="tab-quizzes">
                  Quizzes ({results.quizzes.length})
                </TabsTrigger>
              )}
              {results && results.challenges.length > 0 && (
                <TabsTrigger value="challenges" data-testid="tab-challenges">
                  Challenges ({results.challenges.length})
                </TabsTrigger>
              )}
              {results && results.careerPaths.length > 0 && (
                <TabsTrigger value="paths" data-testid="tab-paths">
                  Career Paths ({results.careerPaths.length})
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {results && results.modules.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <BookOpen className="w-6 h-6" />
                    Modules
                  </h2>
                  <div className="grid gap-4">
                    {results.modules.map((module) => (
                      <Card key={module.id} className="hover-elevate">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle>{module.title}</CardTitle>
                              <CardDescription className="mt-2">{module.description}</CardDescription>
                            </div>
                            <Badge variant="secondary">
                              {module.totalXP} XP
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {module.requiredLevel > 0 && (
                                <span>Level {module.requiredLevel}+</span>
                              )}
                              {module.careerPath && (
                                <>
                                  <span>•</span>
                                  <span>{module.careerPath}</span>
                                </>
                              )}
                            </div>
                            <Button
                              onClick={() => setLocation("/modules")}
                              data-testid={`button-view-module-${module.id}`}
                            >
                              View Module
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {results && results.quizzes.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Trophy className="w-6 h-6" />
                    Quizzes
                  </h2>
                  <div className="grid gap-4">
                    {results.quizzes.map((quiz) => (
                      <Card key={quiz.id} className="hover-elevate">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle>{quiz.title}</CardTitle>
                              <CardDescription className="mt-2">{quiz.description}</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge>{quiz.difficulty}</Badge>
                              <Badge variant="secondary">{quiz.xpReward} XP</Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Button
                            onClick={() => setLocation(`/quiz/${quiz.id}`)}
                            data-testid={`button-start-quiz-${quiz.id}`}
                          >
                            Start Quiz
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {results && results.challenges.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Code2 className="w-6 h-6" />
                    Code Challenges
                  </h2>
                  <div className="grid gap-4">
                    {results.challenges.map((challenge) => (
                      <Card key={challenge.id} className="hover-elevate">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle>{challenge.title}</CardTitle>
                              <CardDescription className="mt-2">{challenge.description}</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge>{challenge.difficulty}</Badge>
                              <Badge variant="secondary">{challenge.xpReward} XP</Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Button
                            onClick={() => setLocation(`/challenge/${challenge.id}`)}
                            data-testid={`button-start-challenge-${challenge.id}`}
                          >
                            Start Challenge
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {results && results.careerPaths.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Briefcase className="w-6 h-6" />
                    Career Paths
                  </h2>
                  <div className="grid gap-4">
                    {results.careerPaths.map((path) => (
                      <Card key={path.id} className="hover-elevate">
                        <CardHeader>
                          <CardTitle>{path.name}</CardTitle>
                          <CardDescription className="mt-2">{path.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-2">
                              {path.skills.slice(0, 5).map((skill, idx) => (
                                <Badge key={idx} variant="outline">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                            <Button
                              onClick={() => setLocation("/careers")}
                              data-testid={`button-view-path-${path.id}`}
                            >
                              View Path
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="modules">
              <div className="grid gap-4">
                {results?.modules.map((module) => (
                  <Card key={module.id} className="hover-elevate">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{module.title}</CardTitle>
                          <CardDescription className="mt-2">{module.description}</CardDescription>
                        </div>
                        <Badge variant="secondary">{module.totalXP} XP</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={() => setLocation("/modules")}>View Module</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="quizzes">
              <div className="grid gap-4">
                {results?.quizzes.map((quiz) => (
                  <Card key={quiz.id} className="hover-elevate">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{quiz.title}</CardTitle>
                          <CardDescription className="mt-2">{quiz.description}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge>{quiz.difficulty}</Badge>
                          <Badge variant="secondary">{quiz.xpReward} XP</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={() => setLocation(`/quiz/${quiz.id}`)}>Start Quiz</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="challenges">
              <div className="grid gap-4">
                {results?.challenges.map((challenge) => (
                  <Card key={challenge.id} className="hover-elevate">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{challenge.title}</CardTitle>
                          <CardDescription className="mt-2">{challenge.description}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge>{challenge.difficulty}</Badge>
                          <Badge variant="secondary">{challenge.xpReward} XP</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={() => setLocation(`/challenge/${challenge.id}`)}>Start Challenge</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="paths">
              <div className="grid gap-4">
                {results?.careerPaths.map((path) => (
                  <Card key={path.id} className="hover-elevate">
                    <CardHeader>
                      <CardTitle>{path.name}</CardTitle>
                      <CardDescription className="mt-2">{path.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          {path.skills.slice(0, 5).map((skill, idx) => (
                            <Badge key={idx} variant="outline">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        <Button onClick={() => setLocation("/careers")}>View Path</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
