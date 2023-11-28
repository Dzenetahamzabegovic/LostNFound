import supertest from "supertest";
import app from "../app.js";  // Assurez-vous que le chemin vers app.js est correct
import mongoose from 'mongoose';
import { cleanUpDatabase, generateValidJwt } from './utils.js';
import { Place } from '../model/Place.js';
import { User } from "../model/User.js";

// Nettoyer la base de données avant chaque test
beforeEach(cleanUpDatabase);

/////////////////////////////////////// POST
describe('POST /places', function () {
    let sami
    beforeEach(async function () {
        [sami] = await Promise.all([
            User.create({ admin: true, firstName: 'Sami', lastName: 'Musta', userName: "samimusta", password: '1234', email: "sami@gmail.com", creationDate: '2023-11-22T20:00:00.268+00:00' })
        ]);
    })
    it("should create a new place with valid info and authentification", async function () {
        const token = await generateValidJwt(sami)
        const res = await supertest(app)
            .post('/places')
            .set('Authorization', `Bearer ${token}`)
            .send({
                geolocalisation: [4.1, 4.1],
                floor: '1',
                description: 'salle S140',
            })
            .expect(201)
            .expect('Content-Type', /json/);
        // Assertions
        expect(res.body).toBeObject();
        expect(res.body._id).toBeString();
        expect(res.body.creationDate).toBeString();
        expect(res.body.geolocalisation).toEqual([4.1, 4.1]);
        expect(res.body.floor).toEqual('1');
        expect(res.body.description).toEqual('salle S140');
        expect(res.body).toContainAllKeys(['_id', 'geolocalisation', 'floor', 'description', 'creationDate']);
    });

    it("should not create a new place without authentification", async function () {
        const res = await supertest(app)
            .post('/places')
            .send({
                geolocalisation: [4.1, 4.1],
                floor: '1',
                description: 'salle S140',
            })
            .expect(401)
            .expect('Content-Type', "text/html; charset=utf-8");
    });

    it("should not create a new object with missing info", async function () {
        const token = await generateValidJwt(sami)
        const res = await supertest(app)
            .post('/places')
            .set('Authorization', `Bearer ${token}`)
            .send({
                floor: '1',
                description: 'salle S140',
            })
            .expect(500)
            .expect('Content-Type', "text/html; charset=utf-8");
    });
})

/////////////////////////////////////// GET
describe('GET /places', function () {
    let S140
    let T140
    let sami
    beforeEach(async function () {
        [S140, T140, sami] = await Promise.all([
            Place.create({ geolocalisation: [4.1, 4.1], floor: '1', description: 'salle S140', creationDate: '2023-11-24T20:00:00.268+00:00' }),
            Place.create({ geolocalisation: [4.1, 4.1], floor: '2', description: 'salle T140', creationDate: '2023-11-23T20:00:00.268+00:00' }),
            User.create({ admin: true, firstName: 'Sami', lastName: 'Musta', userName: "samimusta", password: '1234', email: "sami@gmail.com", creationDate: '2023-11-22T20:00:00.268+00:00' })
        ]);
    })
    
    it('should get a list of all places', async function() {
        const res = await supertest(app)
            .get('/places')
            .expect(200)
            .expect('Content-Type', /json/);
        //Assertions
        expect(res.body).toBeArray();
        expect(res.body).toHaveLength(2);

        expect(res.body[0]).toBeObject();
        expect(res.body[0]._id).toBeString();
        expect(res.body[0].geolocalisation).toEqual([4.1, 4.1]);
        expect(res.body[0].floor).toEqual('1');
        expect(res.body[0].description).toEqual('salle S140');
        expect(res.body[0]).toContainAllKeys(['_id', 'geolocalisation', 'floor', 'description', 'creationDate'])

        expect(res.body[1]).toBeObject();
        expect(res.body[1]._id).toBeString();
        expect(res.body[1].geolocalisation).toEqual([4.1, 4.1]);
        expect(res.body[1].floor).toEqual('2');
        expect(res.body[1].description).toEqual('salle T140');
        expect(res.body[1]).toContainAllKeys(['_id', 'geolocalisation', 'floor', 'description', 'creationDate'])
    })

    it('should get a list of all places on first floor', async function() {
        const res = await supertest(app)
            .get('/places?floor=1')
            .expect(200)
            .expect('Content-Type', /json/);
        //Assertions
        expect(res.body).toBeArray();
        expect(res.body).toHaveLength(1);

        expect(res.body[0]).toBeObject();
        expect(res.body[0]._id).toBeString();
        expect(res.body[0].geolocalisation).toEqual([4.1, 4.1]);
        expect(res.body[0].floor).toEqual('1');
        expect(res.body[0].description).toEqual('salle S140');
        expect(res.body[0]).toContainAllKeys(['_id', 'geolocalisation', 'floor', 'description', 'creationDate'])
    })

    it('should get a specific object by id', async function() {
        const res = await supertest(app)
            .get(`/places/${T140._id}`)
            .expect(200)
            .expect('Content-Type', /json/);
        //Assertions
        expect(res.body).toBeObject();
        expect(res.body._id).toBeString();
        expect(res.body.geolocalisation).toEqual([4.1, 4.1]);
        expect(res.body.floor).toEqual('2');
        expect(res.body.description).toEqual('salle T140');
        expect(res.body).toContainAllKeys(['_id', 'geolocalisation', 'floor', 'description', 'creationDate'])
    })
})

//////////////////////////////////////// DELETE
describe('DELETE /places/:id', function () {
    let S140
    let T140
    let sami
    beforeEach(async function () {
        [S140, T140, sami] = await Promise.all([
            Place.create({ geolocalisation: [4.1, 4.1], floor: '1', description: 'salle S140', creationDate: '2023-11-24T20:00:00.268+00:00' }),
            Place.create({ geolocalisation: [4.1, 4.1], floor: '2', description: 'salle T140', creationDate: '2023-11-23T20:00:00.268+00:00' }),
            User.create({ admin: true, firstName: 'Sami', lastName: 'Musta', userName: "samimusta", password: '1234', email: "sami@gmail.com", creationDate: '2023-11-22T20:00:00.268+00:00' })
        ]);
    })

    it('should delete a place if correctly authenticated', async function () {
        const token = await generateValidJwt(sami)
        const res = await supertest(app)
            .delete(`/places/${S140._id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .expect('Content-Type', "text/html; charset=utf-8")
    })

    it('should not delete a object if no authentification at all', async function () {
        const res = await supertest(app)
            .delete(`/places/${S140._id}`)
            .expect(401)
            .expect('Content-Type', "text/html; charset=utf-8");
    })
})

//////////////////////////////////////// PUT
describe('PUT /places/:id', function () {
    let S140
    let T140
    let sami
    beforeEach(async function () {
        [S140, T140, sami] = await Promise.all([
            Place.create({ geolocalisation: [4.1, 4.1], floor: '1', description: 'salle S140', creationDate: '2023-11-24T20:00:00.268+00:00' }),
            Place.create({ geolocalisation: [4.1, 4.1], floor: '2', description: 'salle T140', creationDate: '2023-11-23T20:00:00.268+00:00' }),
            User.create({ admin: true, firstName: 'Sami', lastName: 'Musta', userName: "samimusta", password: '1234', email: "sami@gmail.com", creationDate: '2023-11-22T20:00:00.268+00:00' })
        ]);
    })

    it('should modify the data of an object if correctly authenticated', async function () {
        const token = await generateValidJwt(sami)
        const res = await supertest(app)
            .put(`/places/${S140._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                geolocalisation: [4.12, 4.12],
                floor: '2',
                description: 'salle S1402',
            })
            .expect(200)
            .expect('Content-Type', /json/);
        //Assertions
        expect(res.body).toBeObject();
        expect(res.body._id).toBeString();
        expect(res.body.geolocalisation).toEqual([4.12, 4.12]);
        expect(res.body.floor).toEqual('2');
        expect(res.body.description).toEqual('salle S1402');
        expect(res.body).toContainAllKeys(['_id', 'geolocalisation', 'floor', 'description', 'creationDate'])
    })

    it('should not modify the data of an object if no authentification', async function () {
        const res = await supertest(app)
            .put(`/places/${S140._id}`)
            .send({
                geolocalisation: [4.12, 4.12],
                floor: '2',
                description: 'salle S1402',
            })
            .expect(401)
            .expect('Content-Type', "text/html; charset=utf-8");
    })
})

// Déconnectez la base de données après tous les tests
afterAll(async () => {
    await mongoose.disconnect();
});
