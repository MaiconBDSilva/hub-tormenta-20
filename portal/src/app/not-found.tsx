'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  useEffect(() => {
    // Força a ida para a página inicial do portal Next
    router.replace('/')
  }, [router])

  return null
}