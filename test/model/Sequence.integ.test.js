const debug = require('debug')('app:test:model:sequence');
const database = require('../../app/config/database');
const Sequence = require('../../app/model/Sequence').Sequence;
const autoincrement = require('../../app/model/Sequence').autoincrement;
const mongoose = require('mongoose');



describe('Sequence integration', () => {
    beforeAll(async () => {
        await database.connect('grocery-test');
        await Sequence.deleteMany({});
    });
    afterEach(async () => {
        await Sequence.deleteMany({});
    });
    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('should create a new sequence', async () => {
        const sequence = await Sequence.create({ name: 'test' });
        expect(sequence).toHaveProperty('_id');
        expect(sequence).toHaveProperty('seq');
        expect(sequence.name).toBe('test');

        const found = await Sequence.findOne({ name: 'test' });
        expect(found).toHaveProperty('_id');
        expect(found).toHaveProperty('seq');
        expect(found).toMatchObject(sequence.toObject());
    });
    it('sould have properties _id, name, seq', async () => {
        const sequence = await Sequence.create({ name: 'test' });
        const found = await Sequence.findOne({ name: 'test' });
        expect(found).toHaveProperty('_id');
        expect(found).toHaveProperty('name');
        expect(found).toHaveProperty('seq');

    });
    describe('Sequence.next()', () => {
        it('should increment the sequence', async () => {
            const sequence = await Sequence.create({ name: 'test' });
            const next = await Sequence.next('test');
            expect(next).toBe(sequence.seq + 1);
        });

        it('should create a new sequence if it does not exist', async () => {
            const next = await Sequence.next('test');
            expect(next).toBe(1);
        });
    });

    describe('autoincrement() plugin with mongoose', () => {
        const schema = new mongoose.Schema({
            name: String,
            id: Number,
        });

        beforeEach(async () => {
            try {
                mongoose.deleteModel('Test');
            } catch (error) { }
        });

        afterEach(async () => {
            try {
                await mongoose.connection.dropCollection('tests');
            } catch (error) { }
        });

        it('should increment the id', async () => {
            schema.plugin(autoincrement('id'));
            const model = mongoose.model('Test', schema);
            const doc = new model({ name: 'test' });
            await doc.save();
            expect(doc.id).toBe(1);
        });
        it('should increment the id on findOneAndUpdate', async () => {
            schema.plugin(autoincrement('id'));
            const model = mongoose.model('Test', schema);
            const doc = new model({ name: 'test' });
            const updated = await model.findOneAndUpdate({ _id: doc._id }, { name: 'test', }, { new: true, upsert: true });
            expect(updated.id).toBe(1);
        });
        it('should increment the id filed (default) without specifying the field', async () => {
            schema.plugin(autoincrement());
            const model = mongoose.model('Test', schema);
            const doc = new model({ name: 'test' });
            await doc.save();
            expect(doc.id).toBe(1);
        });
        it('should throw an error if the field does not exist', () => {
            const schema = new mongoose.Schema({
                name: String,
            });
            expect(() => {
                schema.plugin(autoincrement('id'));
            }).toThrow('Field id does not exist in the schema');
        });

        it('should not increment the id if it is already set', async () => {
            schema.plugin(autoincrement('id'));
            const model = mongoose.model('Test', schema);

            const doc = new model({ name: 'test', id: 100 });
            await doc.save();
            expect(doc.id).toBe(100);
        });
        it('should increment the id for each document', async () => {
            schema.plugin(autoincrement('id'));
            const model = mongoose.model('Test', schema);

            const doc1 = new model({ name: 'test' });
            const doc2 = new model({ name: 'test' });
            await doc1.save();
            await doc2.save();
            expect(doc1.id).toBe(1);
            expect(doc2.id).toBe(2);
        });


    });
});