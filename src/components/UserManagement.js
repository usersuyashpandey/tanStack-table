"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 5;

export function UserManagementTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const currentPage = parseInt(searchParams.get("page") ?? "1");

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const createQueryString = useCallback(
    (name, value) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/users"
      );
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId) => {
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/users/${userId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Failed to delete user");
      return userId;
    },
    onSuccess: (deletedUserId) => {
      queryClient.setQueryData(["users"], (old) =>
        old.filter((user) => user.id !== deletedUserId)
      );
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete user: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = (userId) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    deleteMutation.mutate(userToDelete);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ getValue, row }) => (
          <div>
            <Dialog>
              <DialogTrigger asChild>
                <div
                  onClick={() => setSelectedUser(row.original)}
                  className="cursor-pointer"
                >
                  <div className="font-medium">{getValue()}</div>
                  <div className="text-sm text-gray-500">
                    @{row.original.username}
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{row.original.name}</DialogTitle>
                  <DialogDescription>
                    Detailed information about the user.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      value={row.original.email}
                      className="col-span-3"
                      readOnly
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      value={row.original.phone}
                      className="col-span-3"
                      readOnly
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="website" className="text-right">
                      Website
                    </Label>
                    <Input
                      id="website"
                      value={row.original.website}
                      className="col-span-3"
                      readOnly
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="company" className="text-right">
                      Company
                    </Label>
                    <Input
                      id="company"
                      value={row.original.company.name}
                      className="col-span-3"
                      readOnly
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="address" className="text-right">
                      Address
                    </Label>
                    <Input
                      id="address"
                      value={`${row.original.address.street}, ${row.original.address.city}, ${row.original.address.zipcode}`}
                      className="col-span-3"
                      readOnly
                    />
                  </div>
                </div>
                <DialogFooter>
                  {/* <Button onClick={() => setSelectedUser(false)}>Close</Button> */}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "Contact",
        cell: (info) => (
          <div>
            <div>{info.getValue()}</div>
            <div className="text-sm text-gray-500">
              {info.row.original.phone}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "address",
        header: "Location",
        cell: (info) => {
          const address = info.getValue();
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="text-left">
                    <div>{address.city}</div>
                    <div className="text-sm text-gray-500">
                      {address.zipcode}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {address.street}, {address.suite}
                  </p>
                  <p className="text-xs text-gray-500">
                    Lat: {address.geo.lat}, Lng: {address.geo.lng}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        },
      },
      {
        accessorKey: "website",
        header: "Website",
        cell: (info) => (
          <a
            href={`https://${info.getValue()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {info.getValue()}
          </a>
        ),
      },
      {
        accessorKey: "company",
        header: "Company",
        cell: (info) => {
          const company = info.getValue();
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="text-left">
                    <div>{company.name}</div>
                    <Badge variant="secondary" className="mt-1">
                      {company.bs}
                    </Badge>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{company.catchPhrase}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        },
      },
      {
        accessorKey: "actions",
        header: "Actions",
        cell: (info) => (
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={() => handleDelete(info.row.original.id)}
              className="px-2 py-1"
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: users,
    columns,
    state: {
      globalFilter,
      sorting,
    },
    enableSorting: true,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  useEffect(() => {
    table.setPageSize(itemsPerPage);
    if (currentPage > 0) {
      table.setPageIndex(currentPage - 1);
    }
  }, [currentPage, table, itemsPerPage]);

  const handlePageChange = (newPage) => {
    router.push(`?${createQueryString("page", newPage.toString())}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to fetch user data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Comprehensive user directory with detailed information and filtering
          capabilities.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-1 flex gap-1">
          <Input
            placeholder="Search users..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />
          <Button
            variant="outline"
            onClick={() => setGlobalFilter("")}
            disabled={!globalFilter}
          >
            Clear
          </Button>
          <select
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            value={itemsPerPage}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? "cursor-pointer select-none flex items-center gap-2"
                              : ""
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getIsSorted() === "asc" ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : null}
                        </div>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-20 text-center"
                  >
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between py-1">
          <div className="text-sm text-gray-500">
            Page {currentPage} of {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                user and remove their data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700"
                disabled={deleteMutation.isLoading}
              >
                {deleteMutation.isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
