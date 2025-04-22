import { User as UserIcon } from 'lucide-react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';

import { toggleUserAdminStatus } from './actions';
import { ToggleAdminButton } from './ToggleAdminButton';

export default async function UsersPage() {
  const supabase = await createClient();
  
  // Get all users with their profiles
  const { data: users, error } = await supabase
    .from('profiles')
    .select(`
      id,
      username,
      email,
      name,
      is_admin,
      created_at
    `)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching users:', error.message);
    return <div className="p-4 text-destructive">Error loading users. Please try again later.</div>;
  }
  
  if (!users) {
    return <div className="p-4">No users found.</div>;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>Manage user accounts and permissions.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Avatar</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Avatar className="size-9">
                    <AvatarImage alt={user.name || user.username || 'User Avatar'} />
                    <AvatarFallback>
                      {user.name ? user.name.substring(0, 2).toUpperCase() : user.username ? user.username.substring(0, 2).toUpperCase() : <UserIcon className="size-4" />}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                <TableCell className="text-muted-foreground">{user.username || 'N/A'}</TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.is_admin ? 'default' : 'secondary'}>
                    {user.is_admin ? 'Admin' : 'User'}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {user.created_at ? formatDate(user.created_at) : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <ToggleAdminButton
                      userId={user.id}
                      isAdmin={user.is_admin || false}
                    />
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/users/${user.id}`}>
                        View Profile
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 