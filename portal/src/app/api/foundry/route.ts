import { NextResponse } from "next/server";
// Substitua pelo endereço REAL do seu Foundry VTT 
const FOUNDRY_URL = "http://rpgtormenta.servegame.com:30000";
// ou "https://meuservidor.forge-vtt.com" 
export async function GET() {
    try {
        // Tenta conectar no Foundry com um limite de tempo (timeout) de 3 segundos 
        const response = await fetch(`${FOUNDRY_URL}/api/status`, {
            method: "GET", signal: AbortSignal.timeout(3000), // Se demorar +3s, considera offline 
        });
        // Se o servidor respondeu com sucesso (HTTP status 200 a 299) 
        if (response.ok) {
            return NextResponse.json({ online: true });
        }
        return NextResponse.json({ online: false });
    } catch (error) {
        // Se deu erro de conexão, timeout ou servidor desligado 
        return NextResponse.json({ online: false });
    }
}