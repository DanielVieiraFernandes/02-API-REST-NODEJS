import { expect, test, beforeAll, afterAll, describe, beforeEach } from "vitest";
import { app } from "../src/app";
import request from "supertest";
import { execSync } from "node:child_process";
describe('transaction routes', () => {

    beforeAll(async () => {
        await app.ready();
    })
    afterAll(async () => {
        await app.close();
    })

    beforeEach(async () => {
        execSync("npm run knex migrate:rollback --all");
        execSync('npm run knex migrate:latest');
    })

    test('User can create a new transaction', async () => {
        // fazer a chamada HTTP p/ criar uma nova transação
        //  validação
        await request(app.server)
            .post('/transactions').send({
                title: "New transaction",
                amount: 5000,
                type: "credit",
            }).expect(201);
    })

    test('should be able to list all transactions', async () => {

        const createTransactionResponse = await request(app.server)
            .post('/transactions').send({
                title: "New transaction",
                amount: 5000,
                type: "credit",
            });

        const cookies = createTransactionResponse.get('Set-Cookie');

        if (!cookies) throw new Error('Could not get Set-Cookie');

        const listTransactionsResponse = await request(app.server).get('/transactions').set('Cookie', cookies).expect(200);

        expect(listTransactionsResponse.body.transactions).toEqual([
            expect.objectContaining({
                title: "New transaction",
                amount: 5000,
            })
        ]);

    })

    test('should be able to get a specific transaction', async () => {

        const createTransactionResponse = await request(app.server)
            .post('/transactions').send({
                title: "New transaction",
                amount: 5000,
                type: "credit",
            });

        const cookies = createTransactionResponse.get('Set-Cookie');

        if (!cookies) throw new Error('Could not get Set-Cookie');

        const listTransactionsResponse = await request(app.server).get('/transactions').set('Cookie', cookies).expect(200);

        const transactionId = listTransactionsResponse.body.transactions[0].id;

        const getTransactionResponse = await request(app.server).
            get(`/transactions/${transactionId}`).
            set('Cookie', cookies).
            expect(200);

        expect(getTransactionResponse.body.transaction).toEqual(
            expect.objectContaining({
                title: "New transaction",
                amount: 5000,
            })
        );

    })

    test('should be able to get summary transactions', async () => {

        const createTransactionResponse = await request(app.server)
            .post('/transactions').send({
                title: "New transaction",
                amount: 5000,
                type: "credit",
            });

        const cookies = createTransactionResponse.get('Set-Cookie');

        if (!cookies) throw new Error

        await request(app.server)
            .post('/transactions').set('Cookie', cookies).send({
                title: "New transaction",
                amount: 2000,
                type: "debit",
            });

        if (!cookies) throw new Error('Could not get Set-Cookie');

        const summaryResponseTransactions = await request(app.server).get('/transactions/summary').set('Cookie', cookies).expect(200);

        expect(summaryResponseTransactions.body.summary).toEqual({
            amount: 3000,
        });

    })
})

