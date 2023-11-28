import supertest from "supertest";
import app from "../app.js";
import mongoose from 'mongoose';
import { cleanUpDatabase, generateValidJwt } from './utils.js';
import { User } from '../model/User.js';
import { Object } from '../model/Object.js';
import { Place } from "../model/Place.js";

// Clean database before
beforeEach(cleanUpDatabase)

/////////////////////////////////////// POST
describe('POST /users', function () {
    it("should create a new user with valid credentials", async function () {
        const res = await supertest(app)
            .post('/users')
            .send({
                firstName: 'Sami',
                lastName: 'Musta',
                userName: 'samimusta',
                password: '1234',
                email: 'sami@gmail.com'
            })
            .expect(201)
            .expect('Content-Type', /json/);
        // Assertions
        expect(res.body).toBeObject();
        expect(res.body._id).toBeString();
        expect(res.body.creationDate).toBeString();
        expect(res.body.admin).toEqual(false);
        expect(res.body.firstName).toEqual('Sami');
        expect(res.body.lastName).toEqual('Musta');
        expect(res.body.userName).toEqual('samimusta');
        expect(res.body.email).toEqual('sami@gmail.com');
        expect(res.body).toContainAllKeys(['_id', 'admin', 'firstName', 'lastName', 'userName', 'email', 'creationDate']);
    });

    it("should not create a new user with incorrect credentials", async function () {
        const res = await supertest(app)
            .post('/users')
            .send({
                firstName: 'S',
                lastName: 'M',
                userName: 'sm',
                password: '1',
                email: 'sami@gmail.com'
            })
            .expect(500)
            .expect('Content-Type', "text/html; charset=utf-8");
    });
    it("should not create a new user with missing credentials", async function () {
        const res = await supertest(app)
            .post('/users')
            .send({
                firstName: 'S',
                lastName: 'M',
                userName: 'sm',
                password: '1'
            })
            .expect(500)
            .expect('Content-Type', "text/html; charset=utf-8");
    });
})

/////////////////////////////////////// GET
describe('GET /users', function () {
    let sami
    let thomas
    let dzeneta
    beforeEach(async function () {
        [sami, thomas, dzeneta] = await Promise.all([
            User.create({ admin: true, firstName: 'Sami', lastName: 'Musta', userName: "samimusta", password: '1234', email: "sami@gmail.com", creationDate: '2023-11-22T20:00:00.268+00:00' }),
            User.create({ admin: false, firstName: 'Thomas', lastName: 'Bercht', userName: "thomasbercht", password: '1234', email: "thomas@gmail.com", creationDate: '2023-11-23T20:00:00.268+00:00' }),
            User.create({ admin: false, firstName: 'Dzeneta', lastName: 'Hamza', userName: "dzenetahamza", password: '1234', email: "dzeneta@gmail.com", creationDate: '2023-11-24T20:00:00.268+00:00' }),
        ]);
    })

    it("Should get a list of the last 10 users created in database and sorted by creation date", async function () {
        const res = await supertest(app)
            .get('/users')
            .expect(200)
            .expect('Content-Type', /json/);
        //Assertions
        expect(res.body).toBeArray();
        expect(res.body).toHaveLength(3);

        expect(res.body[2]).toBeObject();
        expect(res.body[2]._id).toBeString();
        expect(res.body[2].admin).toEqual(true);
        expect(res.body[2].firstName).toEqual('Sami');
        expect(res.body[2].lastName).toEqual('Musta');
        expect(res.body[2].userName).toEqual('samimusta');
        expect(res.body[2].email).toEqual('sami@gmail.com');
        expect(res.body[2]).toContainAllKeys(['_id', 'admin', 'firstName', 'lastName', 'userName', 'email', 'creationDate', 'objectsPosted'])

        expect(res.body[1]).toBeObject();
        expect(res.body[1]._id).toBeString();
        expect(res.body[1].admin).toEqual(false);
        expect(res.body[1].firstName).toEqual('Thomas');
        expect(res.body[1].lastName).toEqual('Bercht');
        expect(res.body[1].userName).toEqual('thomasbercht');
        expect(res.body[1].email).toEqual('thomas@gmail.com');
        expect(res.body[1]).toContainAllKeys(['_id', 'admin', 'firstName', 'lastName', 'userName', 'email', 'creationDate', 'objectsPosted'])

        expect(res.body[0]).toBeObject();
        expect(res.body[0]._id).toBeString();
        expect(res.body[0].admin).toEqual(false);
        expect(res.body[0].firstName).toEqual('Dzeneta');
        expect(res.body[0].lastName).toEqual('Hamza');
        expect(res.body[0].userName).toEqual('dzenetahamza');
        expect(res.body[0].email).toEqual('dzeneta@gmail.com');
        expect(res.body[0]).toContainAllKeys(['_id', 'admin', 'firstName', 'lastName', 'userName', 'email', 'creationDate', 'objectsPosted'])
    })

    it("should get one user, on the second page (thomas)", async function () {
        const res = await supertest(app)
            .get('/users?pageSize=1&page=2')
            .expect(200)
            .expect('Content-Type', /json/);
        //Assertions
        expect(res.body).toBeArray();
        expect(res.body).toHaveLength(1);
        expect(res.body[0]).toBeObject();
        expect(res.body[0]._id).toBeString();
        expect(res.body[0].admin).toEqual(false);
        expect(res.body[0].firstName).toEqual('Thomas');
        expect(res.body[0].lastName).toEqual('Bercht');
        expect(res.body[0].userName).toEqual('thomasbercht');
        expect(res.body[0].email).toEqual('thomas@gmail.com');
        expect(res.body[0]).toContainAllKeys(['_id', 'admin', 'firstName', 'lastName', 'userName', 'email', 'creationDate', 'objectsPosted'])
    })

    it('should retrieve a specific user by id', async function () {
        const res = await supertest(app)
            .get(`/users/${sami._id}`)
            .expect(200)
            .expect('Content-Type', /json/);
        //Assertions
        expect(res.body).toBeObject();
        expect(res.body._id).toBeString();
        expect(res.body.admin).toEqual(true);
        expect(res.body.firstName).toEqual('Sami');
        expect(res.body.lastName).toEqual('Musta');
        expect(res.body.userName).toEqual('samimusta');
        expect(res.body.email).toEqual('sami@gmail.com');
        expect(res.body).toContainAllKeys(['_id', 'admin', 'firstName', 'lastName', 'userName', 'email', 'creationDate'])
    });

    it('should retrieve a list of the objects posted by a user', async function () {
        let S140 = await Place.create({ geolocalisation: [4.1, 4.1], floor: '1', description: 'salle S140', creationDate: '2023-11-26T20:00:00.268+00:00' })
        await Object.create({ name: 'hat', picture: 'hat.png', description: 'red small hat', creationDate: '2023-11-26T20:00:00.268+00:00', userId: sami._id, placeId: S140._id })
        const res = await supertest(app)
            .get(`/users/${sami._id}/objects`)
            .expect(200)
            .expect('Content-Type', /json/);
        //Assertions
        expect(res.body).toBeArray();
        expect(res.body).toHaveLength(1);
        expect(res.body[0]._id).toBeString()
        expect(res.body[0].name).toEqual('hat');
        expect(res.body[0].picture).toEqual('hat.png');
        expect(res.body[0].description).toEqual('red small hat');
        expect(res.body[0].userId).toEqual(`${sami._id}`);
        expect(res.body[0].placeId).toEqual(`${S140._id}`);
        expect(res.body[0]).toContainAllKeys(['_id', 'name', 'picture', 'description', 'creationDate', 'userId', 'placeId'])
    });
})

//////////////////////////////////////// DELETE
describe('DELETE /users/:id', function () {
    let sami
    let thomas
    beforeEach(async function () {
        [sami, thomas] = await Promise.all([
            User.create({ admin: true, firstName: 'Sami', lastName: 'Musta', userName: "samimusta", password: '1234', email: "sami@gmail.com", creationDate: '2023-11-22T20:00:00.268+00:00' }),
            User.create({ admin: false, firstName: 'Thomas', lastName: 'Bercht', userName: "thomasbercht", password: '1234', email: "thomas@gmail.com", creationDate: '2023-11-23T20:00:00.268+00:00' })
        ]);
    })

    it('should delete a user if it is correctly authenticated', async function () {
        const token = await generateValidJwt(sami)
        const res = await supertest(app)
            .delete(`/users/${sami._id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .expect('Content-Type', /json/)
        //Assertions
        expect(res.body).toBeObject();
        expect(res.body._id).toBeString();
        expect(res.body.admin).toEqual(true);
        expect(res.body.firstName).toEqual('Sami');
        expect(res.body.lastName).toEqual('Musta');
        expect(res.body.userName).toEqual('samimusta');
        expect(res.body.email).toEqual('sami@gmail.com');
        expect(res.body).toContainAllKeys(['_id', 'admin', 'firstName', 'lastName', 'userName', 'email', 'creationDate'])
    })

    it('should not delete a user if no authentification at all', async function () {
        const res = await supertest(app)
            .delete(`/users/${sami._id}`)
            .expect(401)
            .expect('Content-Type', "text/html; charset=utf-8");
    })

    it('should not delete an other user than the one authenticated', async function () {
        const token = await generateValidJwt(sami)
        const res = await supertest(app)
            .delete(`/users/${thomas._id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(403)
            .expect('Content-Type', "text/html; charset=utf-8");
    })
})

//////////////////////////////////////// PUT
describe('DELETE /users/:id', function () {
    let sami
    let thomas
    beforeEach(async function () {
        [sami, thomas] = await Promise.all([
            User.create({ admin: true, firstName: 'Sami', lastName: 'Musta', userName: "samimusta", password: '1234', email: "sami@gmail.com", creationDate: '2023-11-22T20:00:00.268+00:00' }),
            User.create({ admin: false, firstName: 'Thomas', lastName: 'Bercht', userName: "thomasbercht", password: '1234', email: "thomas@gmail.com", creationDate: '2023-11-23T20:00:00.268+00:00' })
        ]);
    })

    it('should modify the data of a user if correctly authenticated', async function () {
        const token = await generateValidJwt(sami)
        const res = await supertest(app)
            .put(`/users/${sami._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                firstName: 'Sami2',
                lastName: 'Musta2',
                userName: 'samimusta2',
                email: 'sami2@gmail.com',
            })
            .expect(200)
            .expect('Content-Type', /json/);
        //Assertions
        expect(res.body).toBeObject();
        expect(res.body._id).toBeString();
        expect(res.body.admin).toEqual(true);
        expect(res.body.firstName).toEqual('Sami2');
        expect(res.body.lastName).toEqual('Musta2');
        expect(res.body.userName).toEqual('samimusta2');
        expect(res.body.email).toEqual('sami2@gmail.com');
        expect(res.body).toContainAllKeys(['_id', 'admin', 'firstName', 'lastName', 'userName', 'email', 'creationDate'])
    })

    it('should not modify the data of a user if no authentification', async function () {
        const res = await supertest(app)
            .put(`/users/${sami._id}`)
            .send({
                firstName: 'Sami2',
                lastName: 'Musta2',
                userName: 'samimusta2',
                email: 'sami2@gmail.com',
            })
            .expect(401)
            .expect('Content-Type', "text/html; charset=utf-8");
    })

    it('should not modify the data of an other user than the one authenticated', async function () {
        const token = await generateValidJwt(thomas)
        const res = await supertest(app)
            .put(`/users/${sami._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                firstName: 'Sami2',
                lastName: 'Musta2',
                userName: 'samimusta2',
                email: 'sami2@gmail.com',
            })
            .expect(403)
            .expect('Content-Type', "text/html; charset=utf-8");
    })

    it('should modify the admin data to another user than the one authenticated, if the user is admin', async function () {
        const token = await generateValidJwt(sami)
        const res = await supertest(app)
            .put(`/users/${thomas._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                admin: true
            })
            .expect(200)
            .expect('Content-Type', /json/);
        //Assertions
        expect(res.body).toBeObject();
        expect(res.body._id).toBeString();
        expect(res.body.admin).toEqual(true);
        expect(res.body.firstName).toEqual('Thomas');
        expect(res.body.lastName).toEqual('Bercht');
        expect(res.body.userName).toEqual('thomasbercht');
        expect(res.body.email).toEqual('thomas@gmail.com');
        expect(res.body).toContainAllKeys(['_id', 'admin', 'firstName', 'lastName', 'userName', 'email', 'creationDate'])
    })
})

// Disconnect database afterwards
afterAll(async () => {
    await mongoose.disconnect();
});