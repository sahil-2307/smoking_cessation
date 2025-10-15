'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function DatabaseSetupPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [isWorking, setIsWorking] = useState(false)

  const addLog = (message: string) => {
    console.log(message)
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const setupDatabase = async () => {
    setIsWorking(true)
    setLogs([])

    try {
      const supabase = createClient()
      addLog('Starting database setup...')

      // Check if profiles table exists by trying to query it
      addLog('Checking if profiles table exists...')

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .limit(1)

        if (error) {
          addLog(`Profiles table error: ${error.message}`)
          addLog('Profiles table likely does not exist. Creating it...')

          // Create profiles table using SQL
          const { error: createError } = await supabase.rpc('exec_sql', {
            sql: `
              CREATE TABLE IF NOT EXISTS profiles (
                id UUID REFERENCES auth.users PRIMARY KEY,
                username TEXT UNIQUE,
                full_name TEXT,
                avatar_url TEXT,
                quit_date TIMESTAMP WITH TIME ZONE,
                cigarettes_per_day INTEGER,
                years_smoking INTEGER,
                cost_per_pack DECIMAL(10,2),
                cigarettes_per_pack INTEGER DEFAULT 20,
                quit_method TEXT CHECK (quit_method IN ('cold_turkey', 'gradual', 'nrt', 'prescription')),
                reasons_for_quitting TEXT[],
                onboarding_completed BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
              );
            `
          })

          if (createError) {
            addLog(`Error creating table: ${createError.message}`)
            addLog('Trying alternative approach...')

            // Alternative: Try creating via direct SQL execution
            const { error: altError } = await supabase
              .from('profiles')
              .select('*')
              .limit(0) // This will fail but might give us better error info

            addLog(`Alternative check result: ${altError?.message || 'No error'}`)
          } else {
            addLog('✅ Profiles table created successfully!')
          }
        } else {
          addLog('✅ Profiles table already exists!')
          addLog(`Found ${data?.length || 0} profiles`)
        }
      } catch (err: any) {
        addLog(`Error checking profiles: ${err.message}`)
      }

      // Test basic connection
      addLog('Testing basic Supabase connection...')
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        addLog(`✅ Connected as user: ${user.email}`)
        addLog(`User ID: ${user.id}`)
      } else {
        addLog('❌ No authenticated user')
      }

      addLog('Database setup check complete!')

    } catch (error: any) {
      addLog(`❌ Setup failed: ${error.message}`)
    } finally {
      setIsWorking(false)
    }
  }

  const testProfileInsert = async () => {
    setIsWorking(true)
    addLog('Testing profile insert...')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        addLog('❌ Not authenticated')
        return
      }

      const testProfile = {
        id: user.id,
        full_name: 'Test User',
        quit_date: new Date().toISOString(),
        cigarettes_per_day: 10,
        cost_per_pack: 12.50,
        cigarettes_per_pack: 20,
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      }

      addLog('Attempting to insert test profile...')
      const { data, error } = await supabase
        .from('profiles')
        .upsert(testProfile)
        .select()

      if (error) {
        addLog(`❌ Insert failed: ${error.message}`)
        addLog(`Error code: ${error.code}`)
        addLog(`Error details: ${JSON.stringify(error.details)}`)
      } else {
        addLog('✅ Profile insert successful!')
        addLog(`Inserted data: ${JSON.stringify(data)}`)
      }

    } catch (error: any) {
      addLog(`❌ Test failed: ${error.message}`)
    } finally {
      setIsWorking(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Database Setup & Testing</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Database Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={setupDatabase}
              disabled={isWorking}
              className="w-full"
            >
              {isWorking ? 'Checking Database...' : 'Check & Setup Database'}
            </Button>
            <Button
              onClick={testProfileInsert}
              disabled={isWorking}
              variant="outline"
              className="w-full"
            >
              {isWorking ? 'Testing...' : 'Test Profile Insert'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Debug Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500">Click buttons to run diagnostics...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">{log}</div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}