// src/components/features/ProfileForm.tsx
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

export default function ProfileForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [form, setForm] = useState({ name: '', age: '', field: '' });

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="space-y-4 w-full max-w-md"
    >
      <Input label="Your Name" name="name" value={form.name} onChange={handleChange} />
      <Input label="Age" name="age" type="number" value={form.age} onChange={handleChange} />
      <Select
        label="Preferred Field"
        name="field"
        value={form.field}
        onChange={handleChange}
        options={[
          { value: '', label: 'Select...' },
          { value: 'ai', label: 'Artificial Intelligence' },
          { value: 'web', label: 'Web Development' },
          { value: 'design', label: 'UI/UX Design' }
        ]}
      />

    </form>
  );
}
