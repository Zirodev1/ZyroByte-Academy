// backend/test/lessonController.test.js
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server'); // Your Express server
const Lesson = require('../models/Lesson');

chai.use(chaiHttp);
chai.should();

describe("Lessons", () => {
    beforeEach((done) => { // Before each test, empty the database
        Lesson.deleteMany({}, (err) => {
            done();
        });
    });

    describe("/POST lesson", () => {
        it("it should create a new lesson", (done) => {
            let lesson = {
                title: "Test Lesson",
                content: "This is a test content",
                course: "CourseID" // Replace with actual course ID
            };
            chai.request(server)
                .post('/lessons')
                .send(lesson)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('Lesson created successfully');
                    done();
                });
        });
    });
});
