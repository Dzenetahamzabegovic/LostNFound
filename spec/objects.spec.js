import supertest from "supertest";
import app from "../app.js";
import mongoose from 'mongoose';
import { cleanUpDatabase, generateValidJwt } from './utils.js';
import { User } from '../model/User.js';
import { Place } from '../model/Place.js';
import { Object } from '../model/Object.js';

// Nettoyage de la base de données avant chaque test
beforeEach(cleanUpDatabase);

/////////////////////////////////////// POST
describe('POST /objects', function () {
    let sami
    let S140
    beforeEach(async function () {
        [sami, S140] = await Promise.all([
            User.create({ admin: true, firstName: 'Sami', lastName: 'Musta', userName: "samimusta", password: '1234', email: "sami@gmail.com", creationDate: '2023-11-22T20:00:00.268+00:00' }),
            Place.create({ geolocalisation: [4.1, 4.1], floor: '1', description: 'salle S140', creationDate: '2023-11-23T20:00:00.268+00:00' }),
        ]);
    })
    it("should create a new object with valid credentials and authentification", async function () {
        const token = await generateValidJwt(sami)
        const res = await supertest(app)
            .post('/objects')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Hat',
                picture: 'hat.png',
                description: 'red hat',
                userId: `${sami._id}`,
                placeId: `${S140._id}`
            })
            .expect(201)
            .expect('Content-Type', /json/);
        // Assertions
        expect(res.body).toBeObject();
        expect(res.body._id).toBeString();
        expect(res.body.creationDate).toBeString();
        expect(res.body.name).toEqual('Hat');
        expect(res.body.picture).toEqual('hat.png');
        expect(res.body.description).toEqual('red hat');
        expect(res.body.userId).toEqual(`${sami._id}`);
        expect(res.body.placeId).toEqual(`${S140._id}`);
        expect(res.body).toContainAllKeys(['_id', 'name', 'picture', 'description', 'userId', 'placeId', 'creationDate']);
    });

    it("should not create a new object without valid credentials and authentification", async function () {
        const res = await supertest(app)
            .post('/objects')
            .send({
                name: 'Hat',
                picture: 'hat.png',
                description: 'red hat',
                userId: `${sami._id}`,
                placeId: `${S140._id}`
            })
            .expect(401)
            .expect('Content-Type', "text/html; charset=utf-8");
    });

    it("should not create a new object with missing info", async function () {
        const token = await generateValidJwt(sami)
        const res = await supertest(app)
            .post('/objects')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Hat',
                picture: 'hat.png',
                description: 'red hat',
            })
            .expect(500)
            .expect('Content-Type', "text/html; charset=utf-8");
    });
})

/////////////////////////////////////// GET
describe('GET /objects', function () {
    let sami
    let S140
    let hat
    let pull
    beforeEach(async function () {
        [sami, S140] = await Promise.all([
            User.create({ admin: true, firstName: 'Sami', lastName: 'Musta', userName: "samimusta", password: '1234', email: "sami@gmail.com", creationDate: '2023-11-22T20:00:00.268+00:00' }),
            Place.create({ geolocalisation: [4.1, 4.1], floor: '1', description: 'salle S140', creationDate: '2023-11-23T20:00:00.268+00:00' })
        ]);
        [hat, pull] = await Promise.all([
            Object.create({ name: 'hat', picture: 'hat.png', description: 'red hat', placeId: `${S140._id}`, userId: `${sami._id}`, creationDate: '2023-11-24T20:00:00.268+00:00'}),
            Object.create({ name: 'pull', picture: 'pull.png', description: 'red pull', placeId: `${S140._id}`, userId: `${sami._id}`, creationDate: '2023-11-25T20:00:00.268+00:00'})
        ]);
    })
    
    it('should get a list of all objects', async function() {
        const res = await supertest(app)
            .get('/objects')
            .expect(200)
            .expect('Content-Type', /json/);
        //Assertions
        expect(res.body).toBeArray();
        expect(res.body).toHaveLength(2);

        expect(res.body[0]).toBeObject();
        expect(res.body[0]._id).toBeString();
        expect(res.body[0].name).toEqual('hat');
        expect(res.body[0].picture).toEqual('hat.png');
        expect(res.body[0].description).toEqual('red hat');
        expect(res.body[0].userId).toEqual(`${sami._id}`);
        expect(res.body[0].placeId).toEqual(`${S140._id}`);
        expect(res.body[0]).toContainAllKeys(['_id', 'name', 'picture', 'description', 'userId', 'placeId', 'creationDate'])

        expect(res.body[1]).toBeObject();
        expect(res.body[1]._id).toBeString();
        expect(res.body[1].name).toEqual('pull');
        expect(res.body[1].picture).toEqual('pull.png');
        expect(res.body[1].description).toEqual('red pull');
        expect(res.body[1].userId).toEqual(`${sami._id}`);
        expect(res.body[1].placeId).toEqual(`${S140._id}`);
        expect(res.body[1]).toContainAllKeys(['_id', 'name', 'picture', 'description', 'userId', 'placeId', 'creationDate'])
    })

    it('should get a specific object by id', async function() {
        const res = await supertest(app)
            .get(`/objects/${hat._id}`)
            .expect(200)
            .expect('Content-Type', /json/);
        //Assertions
        expect(res.body).toBeObject();
        expect(res.body._id).toBeString();
        expect(res.body.name).toEqual('hat');
        expect(res.body.picture).toEqual('hat.png');
        expect(res.body.description).toEqual('red hat');
        expect(res.body.userId).toEqual(`${sami._id}`);
        expect(res.body.placeId).toEqual(`${S140._id}`);
        expect(res.body).toContainAllKeys(['_id', 'name', 'picture', 'description', 'userId', 'placeId', 'creationDate'])
    })
})

//////////////////////////////////////// DELETE
describe('DELETE /objects/:id', function () {
    let sami
    let thomas
    let S140
    let hat
    let pull
    beforeEach(async function () {
        [sami, thomas, S140] = await Promise.all([
            User.create({ admin: true, firstName: 'Sami', lastName: 'Musta', userName: "samimusta", password: '1234', email: "sami@gmail.com", creationDate: '2023-11-22T20:00:00.268+00:00' }),
            User.create({ admin: false, firstName: 'Thomas', lastName: 'Bercht', userName: "thomasbercht", password: '1234', email: "thomas@gmail.com", creationDate: '2023-11-22T20:00:00.268+00:00' }),
            Place.create({ geolocalisation: [4.1, 4.1], floor: '1', description: 'salle S140', creationDate: '2023-11-23T20:00:00.268+00:00' })
        ]);
        [hat, pull] = await Promise.all([
            Object.create({ name: 'hat', picture: 'hat.png', description: 'red hat', placeId: `${S140._id}`, userId: `${sami._id}`, creationDate: '2023-11-24T20:00:00.268+00:00'}),
            Object.create({ name: 'pull', picture: 'pull.png', description: 'red pull', placeId: `${S140._id}`, userId: `${thomas._id}`, creationDate: '2023-11-25T20:00:00.268+00:00'})
        ]);
    })

    it('should delete a object if correctly authenticated', async function () {
        const token = await generateValidJwt(sami)
        const res = await supertest(app)
            .delete(`/objects/${hat._id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .expect('Content-Type', "text/html; charset=utf-8")
    })

    it('should not delete a object if no authentification at all', async function () {
        const res = await supertest(app)
            .delete(`/objects/${hat._id}`)
            .expect(401)
            .expect('Content-Type', "text/html; charset=utf-8");
    })

    it('should not delete an object if user authenticated didnt post the object', async function () {
        const token = await generateValidJwt(thomas)
        const res = await supertest(app)
            .delete(`/objects/${hat._id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(403)
            .expect('Content-Type', "text/html; charset=utf-8");
    })
})

//////////////////////////////////////// PUT
describe('PUT /objects/:id', function () {
    let sami
    let thomas
    let S140
    let hat
    let pull
    beforeEach(async function () {
        [sami, thomas, S140] = await Promise.all([
            User.create({ admin: true, firstName: 'Sami', lastName: 'Musta', userName: "samimusta", password: '1234', email: "sami@gmail.com", creationDate: '2023-11-22T20:00:00.268+00:00' }),
            User.create({ admin: false, firstName: 'Thomas', lastName: 'Bercht', userName: "thomasbercht", password: '1234', email: "thomas@gmail.com", creationDate: '2023-11-22T20:00:00.268+00:00' }),
            Place.create({ geolocalisation: [4.1, 4.1], floor: '1', description: 'salle S140', creationDate: '2023-11-23T20:00:00.268+00:00' })
        ]);
        [hat, pull] = await Promise.all([
            Object.create({ name: 'hat', picture: 'hat.png', description: 'red hat', placeId: `${S140._id}`, userId: `${sami._id}`, creationDate: '2023-11-24T20:00:00.268+00:00'}),
            Object.create({ name: 'pull', picture: 'pull.png', description: 'red pull', placeId: `${S140._id}`, userId: `${thomas._id}`, creationDate: '2023-11-25T20:00:00.268+00:00'})
        ]);
    })

    it('should modify the data of an object if correctly authenticated', async function () {
        const token = await generateValidJwt(sami)
        const res = await supertest(app)
            .put(`/objects/${hat._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'hat2',
                picture: 'hat2.png',
                description: 'red hat2',
            })
            .expect(200)
            .expect('Content-Type', /json/);
        //Assertions
        expect(res.body).toBeObject();
        expect(res.body._id).toBeString();
        expect(res.body.name).toEqual('hat2');
        expect(res.body.picture).toEqual('hat2.png');
        expect(res.body.description).toEqual('red hat2');
        expect(res.body.userId).toEqual(`${sami._id}`);
        expect(res.body.placeId).toEqual(`${S140._id}`);
        expect(res.body).toContainAllKeys(['_id', 'name', 'picture', 'description', 'userId', 'placeId', 'creationDate'])
    })

    it('should not modify the data of an object if no authentification', async function () {
        const res = await supertest(app)
            .put(`/objects/${hat._id}`)
            .send({
                name: 'hat2',
                picture: 'hat2.png',
                description: 'red hat2',
            })
            .expect(401)
            .expect('Content-Type', "text/html; charset=utf-8");
    })

    it('should not modify the data of an object posted by an other user than the one authenticated', async function () {
        const token = await generateValidJwt(thomas)
        const res = await supertest(app)
            .put(`/objects/${hat._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'hat2',
                picture: 'hat2.png',
                description: 'red hat2',
            })
            .expect(403)
            .expect('Content-Type', "text/html; charset=utf-8");
    })
})

// Déconnexion de la base de données après tous les tests
afterAll(async () => {
    await mongoose.disconnect();
});
