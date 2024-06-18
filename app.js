require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const { Model, raw } = require("objection");
const { Dog } = require("./models/Dog");
const knexConfig = require("./knexfile");

app.use(cors());
app.use(bodyParser.json());

const knex = require("knex")(knexConfig);

Model.knex(knex);

app.get("/dogs", async (req, res) => {
  try {
    const dogs = await Dog.query();

    if (dogs) {
      return res.json(dogs);
    }

    throw Error("There are no dogs");
  } catch (error) {
    res.json({ error: error.message });
  }
});

app.post("/dogs", async (req, res) => {
  console.log("data", req.body);
  try {
    const dog = await Dog.query().insert({
      name: req.body.name,
      breed: req.body.breed,
      img: req.body.img,
      genre: req.body.genre,
      bio: req.body.bio,
    });
    if (dog) {
      return res.json(dog);
    }
    throw Error("Error while trying to insert a new dog");
  } catch (error) {
    return res.json({ error: error.message });
  }
});

app.get("/dogs/breeds", async (req, res) => {
  try {
    const dogs = await knex.raw(
      "WITH cte as (select *, ROW_NUMBER() OVER (PARTITION BY breed ORDER BY id desc) row_numer from dogs) select * from cte where row_numer < 3"
    );

    if (dogs) {
      return res.json(dogs.rows);
    }

    throw Error("There are no dogs");
  } catch (error) {
    res.json({ error: error.message });
  }
});

app.get("/dogs/:breed", async (req, res) => {
  try {
    const breed = req.params.breed;
    const dogs = await Dog.query().where("breed", breed);

    if (dogs) {
      return res.json(dogs);
    }

    throw Error(`There are no dogs of breed "${breed}"`);
  } catch (error) {
    res.json({ error: error.message });
  }
});

app.get("/dogs/:breed/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const dog = await Dog.query().findById(id);

    if (dog) {
      return res.json(dog);
    }

    throw Error(`Dog with id "${id}" does not exist`);
  } catch (error) {
    res.json({ error: error.message });
  }
});

app.patch("/dogs/:breed/:id/gooddog", async (req, res) => {
  try {
    const id = req.params.id;
    const dog = await Dog.query().patchAndFetchById(id, {
      good_dog: raw("good_dog + 1"),
    });

    if (dog) {
      return res.json(dog);
    }

    throw Error(`Dog with id "${id}" does not exist`);
  } catch (error) {
    res.json({ error: error.message });
  }
});

app.listen(process.env.PORT || 3001, function () {
  console.log("running...");
});
