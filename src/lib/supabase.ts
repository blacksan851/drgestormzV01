/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// As chaves do Supabase foram injetadas do lado do servidor/enviroment.
// Fallback para o URL fornecido em caso de desenvolvimento local ou quando não existir no vite.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://elzwayftpjxarbjzvtfu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsendheWZ0cGp4YXJianp2dGZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MzM2MDgsImV4cCI6MjA5NDEwOTYwOH0.ecdsyRHxakagyYUS0ocELOobUGXzqGHTZmEE-Jv3rKk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
