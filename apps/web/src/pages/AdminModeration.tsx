import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  deleteAdminModerationComment,
  deleteAdminModerationImage,
  getAdminModerationComments,
  getAdminModerationImages,
} from "@/services/api/adminService";

const tabs = ["comments", "images"] as const;

const AdminModeration = () => {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("comments");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;
  const offset = (page - 1) * limit;

  const commentsQuery = useQuery({
    queryKey: ["admin", "moderation", "comments", { search, limit, offset }],
    queryFn: () => getAdminModerationComments({ search, limit, offset }),
    enabled: activeTab === "comments",
    keepPreviousData: true,
  });

  const imagesQuery = useQuery({
    queryKey: ["admin", "moderation", "images", { limit, offset }],
    queryFn: () => getAdminModerationImages({ limit, offset }),
    enabled: activeTab === "images",
    keepPreviousData: true,
  });

  const data = activeTab === "comments" ? commentsQuery.data : imagesQuery.data;
  const isLoading = activeTab === "comments" ? commentsQuery.isLoading : imagesQuery.isLoading;
  const error = activeTab === "comments" ? commentsQuery.error : imagesQuery.error;

  const totalPages = data ? Math.max(Math.ceil(data.total / limit), 1) : 1;

  const handleDelete = async (id: string) => {
    if (!window.confirm("Remove this content?")) return;
    if (activeTab === "comments") {
      await deleteAdminModerationComment(id);
      await commentsQuery.refetch();
    } else {
      await deleteAdminModerationImage(id);
      await imagesQuery.refetch();
    }
  };

  return (
    <AdminLayout title="Content Moderation">
      <Card>
        <CardHeader className="space-y-3">
          <CardTitle className="text-lg">Moderation Queue</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            {tabs.map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setActiveTab(tab);
                  setPage(1);
                }}
              >
                {tab === "comments" ? "Story Comments" : "Story Images"}
              </Button>
            ))}
          </div>
          {activeTab === "comments" && (
            <Input
              placeholder="Search comments"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className="md:max-w-xs"
            />
          )}
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-sm text-slate-600">Loading moderation data...</p>}
          {error && <p className="text-sm text-red-600">Failed to load moderation data.</p>}
          {!isLoading && !error && data && (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.total === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-sm text-slate-500">
                        No content found.
                      </TableCell>
                    </TableRow>
                  )}
                  {activeTab === "comments" &&
                    data.comments?.map((comment) => (
                      <TableRow key={comment.id}>
                        <TableCell>
                          <div className="text-sm font-medium text-slate-900">{comment.name}</div>
                          <div className="text-xs text-slate-500">{comment.text}</div>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(comment.id)}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  {activeTab === "images" &&
                    data.images?.map((image) => (
                      <TableRow key={image.id}>
                        <TableCell>
                          <div className="text-sm font-medium text-slate-900">{image.caption || "Story image"}</div>
                          <div className="text-xs text-slate-500">{image.url}</div>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {new Date(image.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(image.id)}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>{data.total} total</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((current) => Math.max(current - 1, 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span>
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminModeration;
