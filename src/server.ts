import express, { request, response } from 'express'
import { PrismaClient } from '@prisma/client'
import cors from 'cors'
import { convertHourStringToMinutes } from './utils/convert-hour-string-to-minutes'
import { convertMinutesToHourString } from './utils/convert-minutes-to-hour-string'
const app = express()
app.use(express.json())
app.use(cors())




const prisma = new PrismaClient({
    log: ['query']
})

// Methods HTTP / API REST / HTTP CODES ele mostra se a resposta

// GET, POST, PUT, PATCH, DELETE

/*
GET : Buscando
POST: Criando
PUT: Editando DE MODO GERAL (QUANDO TEM MAIS QUE UMA EDIÇÃO)
PATCH: Editando DE MODO ESPECIFICA
DELETE: Excluindo


                            REPRENSATAÇÕES DOS HTTP Codes

    Os HTTP Codes que começão com status com a numeração 1 = REPRESENTA INFORMAÇÃO  (100-199)
    return response.status(201).json([]);

    Os HTTP Codes que começão com status com a numeração 2 = REPRESENTA SUCESSO   (200-299)
    return response.status(201).json([]);

    Os HTTP Codes que começão com status com a numeração 3 = REPRESENTA REDIRECIONAMENTOS (300-399)
    return response.status(300).json([]);

    Os HTTP Codes que começão com status com a numeração 4 = REPRESENTA ERROS POR CODIGO BUGADO (400-499)
    return response.status(400).json([]);

    Os HTTP Codes que começão com status com a numeração 500/DERIVADOS = REPRESENTA ERROS INESPERADO  (500-599)
    return response.status(500).json([]);


                                TIPOS DE PARAMETROS
    
    Query: http://localhost:3333/ads?page:2 (sempre é nomeado)
    Route: http://localhost:3333/ads/como-criar-uma-api-em-node (não é nomeado)
    Body: fica escondido da requesição e não na url (para quando vamos enviar varias informações de uma vez)

 */
app.get('/games', async (request, response) => {
    const games = await prisma.game.findMany({
        include: {
            _count: {
                select: {
                    ads: true,
                },
            },
        },
    });
    return response.json(games);
});



app.post('/games/:id/ads', async (request, response) => {
    const gameId = request.params.id;
    const body = request.body;

    const ad = await prisma.ad.create({
        data: {
            gameId,
            name: body.name,
            yearPlaying: body.yearPlaying,
            discord: body.discord,
            weekDays: body.weekDays.join(','),
            hourStart: convertHourStringToMinutes(body.hourStart),
            hourEnd: convertHourStringToMinutes(body.hourEnd),
            useVoiceChannel: body.useVoiceChannel,
        }
    })

    return response.status(201).json(ad);
});




app.get('/games/:id/ads', async (request, response) => {

    const gameId = request.params.id;
    const ads = await prisma.ad.findMany({
        select: {
            id: true,
            name: true,
            weekDays: true,
            useVoiceChannel: true,
            yearPlaying: true,
            hourStart: true,
            hourEnd: true,

        },
        where: {
            gameId,
        },
        orderBy: {
            creatdAt: 'desc'
        }
    })
    return response.json(ads.map(ad => {
        return {
            ...ad,
            weekDays: ad.weekDays.split(','),
            hourStart:convertMinutesToHourString(ad.hourStart),
            hourEnd:convertMinutesToHourString(ad.hourEnd)
        }
    }))

})


app.get('/ads/:id/discord', async (request, response) => {

    const adId = request.params.id;
    const ad = await prisma.ad.findUniqueOrThrow({
        select: {
            discord: true,
        },
        where: {
            id: adId,
        }
    })


    return response.json({
        discord: ad.discord,
    })



})





app.listen(3333)