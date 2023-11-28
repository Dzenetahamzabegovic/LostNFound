import supertest from "supertest"
import app from "../app.js"
import mongoose from 'mongoose'
import { cleanUpDatabase } from './utils.js'
import { User } from '../model/User.js'
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { jest } from '@jest/globals'

//Clean database before
beforeEach(cleanUpDatabase)

////////////////////////////////////////////LOGIN
describe('POST /login', function () {
    //Create 2 users to begin the tests
    let sami
    beforeEach(async function () {
        //Hash the passwords
        const plainPassword = '1234';
        const costFactor = 10;
        const hashedPassword = await bcrypt.hash(plainPassword, costFactor);
        sami = await Promise.any([
            User.create({ admin: false, firstName: 'Sami', lastName: 'Musta', userName: "samimusta", password: hashedPassword, email: "sami@gmail.com", creationDate: '2023-11-22T20:00:00.268+00:00' }),
        ]);
    })

    //Connect to own account
    it("user should connect to his own account", async function () {
        const res = await supertest(app)
            .post('/login')
            .send({
                userName: 'samimusta',
                password: '1234'
            })
            .expect(200)
            .expect('Content-Type', /json/);
        // Assertions
        expect(res.body).toBeObject();
        expect(res.body.token).toBeString();

        // Verify the token
        const decoded = jwt.verify(res.body.token, process.env.SECRET_KEY);
        expect(decoded.sub).toEqual(sami._id.toString());
    });

    //Try to connect to account with bad password
    it("user should not connect with a bad password", async function () {
        const res = await supertest(app)
            .post('/login')
            .send({
                userName: 'samimusta',
                password: '5678'
            })
            .expect(401)
            .expect('Content-Type', "text/plain; charset=utf-8");
    })

    //Try to connect to unexisting account
    it("user should not connect to unexisting account", async function () {
        const res = await supertest(app)
            .post('/login')
            .send({
                userName: 'unexisting',
                password: '1234'
            })
            .expect(401)
            .expect('Content-Type', "text/plain; charset=utf-8");
    })

    //Database error during search of user
    it("should handle database errors during user search", async () => {
        // Mock User.findOne to simulate a database error
        jest.spyOn(User, 'findOne').mockImplementationOnce(() => {
            throw new Error("Database error");
        });

        const res = await supertest(app)
            .post('/login')
            .send({
                userName: 'samimusta',
                password: '1234'
            })
            .expect(500)
            .expect('Content-Type', "text/html; charset=utf-8");

        // Restore original implementation
        User.findOne.mockRestore();
    });

    //bcrypt error during bcrypt comparison
    it("should handle bcrypt errors during password comparison", async () => {
        // Mock bcrypt.compare to simulate an error
        jest.spyOn(bcrypt, 'compare').mockImplementationOnce((_, __, callback) => {
            callback(new Error("Bcrypt error"), null);
        });

        await supertest(app)
            .post('/login')
            .send({ 
                userName: 'samimusta', 
                password: '1234' 
            })
            .expect(500)
            .expect('Content-Type', "text/html; charset=utf-8");

        // Restore original implementation
        bcrypt.compare.mockRestore();
    });

    //JWT error during token generation
    it("should handle JWT errors during token generation", async () => {
        // Mock jwt.sign to simulate an error
        jest.spyOn(jwt, 'sign').mockImplementationOnce((payload, secretKey, callback) => {
            callback(new Error("JWT error"), null);
        });

        await supertest(app)
            .post('/login')
            .send({ 
                userName: 'samimusta', 
                password: '1234' 
            })
            .expect(500)
            .expect('Content-Type', "text/html; charset=utf-8");

        // Restore original implementation
        jwt.sign.mockRestore();
    });
})

//Disconnect database afterwards
afterAll(async () => {
    await mongoose.disconnect();
});