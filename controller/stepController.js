
const db = require('../models')
const fs = require("fs")


class stepController {
    index = (req, res) => {
        res.send("Step Controllers")
    }

    handleDeleteStep = async (req, res) => {
        let {recipeId, stepId } = req.params
        console.log(req.params)
        try {
            let step = await db.Step.findOne({where: {recipeId: recipeId, stepId: stepId}})
            console.log(step)
        } catch (error) {
            
        }
    }

    getAllStep = async (req, res) => {
        let step = await db.Step.findAll()
        res.json({
            success: true,
            data: step
        })
    }

}

module.exports = new stepController