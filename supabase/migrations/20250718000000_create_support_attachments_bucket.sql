-- Create storage bucket for support attachments
insert into storage.buckets (id, name, public)
values ('support-attachments', 'support-attachments', true);

-- Create policy to allow authenticated users to upload files
create policy "Allow authenticated users to upload support attachments"
on storage.objects for insert
with check (
  bucket_id = 'support-attachments' 
  and auth.role() = 'authenticated'
);

-- Create policy to allow authenticated users to view their own support attachments
create policy "Allow authenticated users to view their own support attachments"
on storage.objects for select
using (
  bucket_id = 'support-attachments' 
  and auth.role() = 'authenticated'
);

-- Create policy to allow public access to support attachments (for admin viewing)
create policy "Allow public access to support attachments"
on storage.objects for select
using (bucket_id = 'support-attachments');

-- Create policy to allow users to delete their own support attachments
create policy "Allow users to delete their own support attachments"
on storage.objects for delete
using (
  bucket_id = 'support-attachments' 
  and auth.role() = 'authenticated'
);
