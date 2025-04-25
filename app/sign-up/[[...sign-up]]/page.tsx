'use client';

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from 'next/navigation';

export default function Page() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url');
  
  return (
    <div className="flex justify-center items-center py-24">
      <SignUp redirectUrl={redirectUrl || '/dashboard'} />
    </div>
  );
} 