import { useMemo } from "react";
import {
  FileText,
  Users,
  HardDrive,
  TrendingUp,
  Clock,
  BarChart3,
} from "lucide-react";
import { format, subDays, isAfter } from "date-fns";
import type { AuthDocument, AuthUser } from "../../types/auth";
import { getFileTypeInfo } from "../../utils/fileTypes";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

interface AnalyticsDashboardProps {
  documents: AuthDocument[];
  users?: Omit<AuthUser, "password">[];
}

export function AnalyticsDashboard({
  documents,
  users = [],
}: AnalyticsDashboardProps) {
  // Calculate statistics
  const stats = useMemo(() => {
    // Total storage (fileSize is now in bytes as a number)
    const totalBytes = documents.reduce(
      (acc, doc) => acc + (typeof doc.fileSize === "number" ? doc.fileSize : 0),
      0,
    );
    const totalStorage = formatBytes(totalBytes);

    // Documents by type
    const byType: Record<string, number> = {};
    documents.forEach((doc) => {
      const info = getFileTypeInfo(doc.fileType);
      byType[info.category] = (byType[info.category] || 0) + 1;
    });

    // Documents by user
    const byUser: Record<string, number> = {};
    documents.forEach((doc) => {
      byUser[doc.userId] = (byUser[doc.userId] || 0) + 1;
    });

    // Recent uploads (last 7 days)
    const sevenDaysAgo = subDays(new Date(), 7);
    const recentUploads = documents.filter((doc) =>
      isAfter(new Date(doc.uploadDate), sevenDaysAgo),
    );

    // Upload activity by day (last 7 days)
    const activityByDay: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      const count = documents.filter((doc) => {
        const uploadDate = new Date(doc.uploadDate);
        return uploadDate >= dayStart && uploadDate <= dayEnd;
      }).length;
      activityByDay.push({
        date: format(date, "EEE"),
        count,
      });
    }

    // Most active users
    const userActivity = users
      .map((user) => ({
        user,
        documentCount: byUser[user.id] || 0,
      }))
      .sort((a, b) => b.documentCount - a.documentCount);

    return {
      totalDocuments: documents.length,
      totalStorage,
      totalStorageBytes: totalBytes,
      totalUsers: users.length,
      recentUploadsCount: recentUploads.length,
      byType,
      byUser,
      activityByDay,
      userActivity,
      recentDocuments: documents
        .sort(
          (a, b) =>
            new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime(),
        )
        .slice(0, 5),
    };
  }, [documents, users]);

  // Get max for chart scaling
  const maxActivity = Math.max(...stats.activityByDay.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          label="Total Documents"
          value={stats.totalDocuments.toString()}
          subValue={`${stats.recentUploadsCount} this week`}
          variant="blue"
        />
        <StatCard
          icon={HardDrive}
          label="Storage Used"
          value={stats.totalStorage}
          subValue="Across all files"
          variant="green"
        />
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats.totalUsers.toString()}
          subValue={`${stats.userActivity.filter((u) => u.documentCount > 0).length} active`}
          variant="purple"
        />
        <StatCard
          icon={TrendingUp}
          label="This Week"
          value={`+${stats.recentUploadsCount}`}
          subValue="New uploads"
          variant="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="w-5 h-5 text-muted-foreground" />
              Upload Activity (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-48">
              {stats.activityByDay.map((day, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div className="w-full flex flex-col items-center justify-end h-40">
                    <div
                      className="w-full max-w-[40px] bg-primary rounded-t-md transition-all hover:bg-primary/80"
                      style={{
                        height: `${(day.count / maxActivity) * 100}%`,
                        minHeight: day.count > 0 ? "8px" : "0px",
                      }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-muted-foreground">
                      {day.date}
                    </p>
                    <p className="text-sm font-semibold">{day.count}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Documents by type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Documents by Type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(stats.byType)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 6)
              .map(([type, count]) => {
                const info = getFileTypeInfo(type);
                const percentage = Math.round(
                  (count / stats.totalDocuments) * 100,
                );

                return (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <info.icon className={cn("w-4 h-4", info.color)} />
                        <span className="capitalize text-muted-foreground">
                          {type}
                        </span>
                      </div>
                      <Badge variant="secondary">
                        {count} ({percentage}%)
                      </Badge>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most active users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-5 h-5 text-muted-foreground" />
              Most Active Users
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.userActivity
              .slice(0, 5)
              .map(({ user, documentCount }, index) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-medium text-muted-foreground w-4">
                    {index + 1}.
                  </span>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-primary-foreground text-sm">
                      {user.firstName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <Badge variant="outline">{documentCount} docs</Badge>
                </div>
              ))}
          </CardContent>
        </Card>

        {/* Recent uploads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="w-5 h-5 text-muted-foreground" />
              Recent Uploads
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.recentDocuments.map((doc) => {
              const fileInfo = getFileTypeInfo(doc.fileType);
              const owner = users.find((u) => u.id === doc.userId);

              return (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className={cn("p-2 rounded-lg", fileInfo.bgColor)}>
                    <fileInfo.icon className={cn("w-4 h-4", fileInfo.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">
                      by{" "}
                      {owner
                        ? `${owner.firstName} ${owner.lastName}`
                        : "Unknown"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(doc.uploadDate), "MMM d")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(
                        typeof doc.fileSize === "number" ? doc.fileSize : 0,
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Stat card component
function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  variant,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  subValue: string;
  variant: "blue" | "green" | "purple" | "orange";
}) {
  const variantStyles = {
    blue: {
      bg: "bg-blue-500/10",
      text: "text-blue-600 dark:text-blue-400",
    },
    green: {
      bg: "bg-green-500/10",
      text: "text-green-600 dark:text-green-400",
    },
    purple: {
      bg: "bg-purple-500/10",
      text: "text-purple-600 dark:text-purple-400",
    },
    orange: {
      bg: "bg-orange-500/10",
      text: "text-orange-600 dark:text-orange-400",
    },
  };

  const styles = variantStyles[variant];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={cn("p-3 rounded-lg", styles.bg)}>
            <Icon size={24} className={styles.text} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{subValue}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return `${size.toFixed(1)} ${units[i]}`;
}

export default AnalyticsDashboard;
