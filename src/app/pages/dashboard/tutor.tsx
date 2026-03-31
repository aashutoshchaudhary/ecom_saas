import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Play, CheckCircle } from "lucide-react";
import { mockCourses } from "../../lib/mock-data";

export function Tutor() {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-1">Training Center</h1>
        <p className="text-gray-600 dark:text-gray-400">Learn and grow with our courses</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCourses.map((course) => (
          <Card key={course.id}>
            <div className="aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
            </div>
            <CardHeader>
              <CardTitle>{course.title}</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">{course.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="font-semibold">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} />
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>{course.lessons} lessons</span>
                  <span>{course.duration}</span>
                </div>
                {course.progress === 100 ? (
                  <Badge className="w-full justify-center bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Completed
                  </Badge>
                ) : (
                  <Button className="w-full gap-2">
                    <Play className="w-4 h-4" />
                    {course.progress > 0 ? "Continue" : "Start"} Course
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
