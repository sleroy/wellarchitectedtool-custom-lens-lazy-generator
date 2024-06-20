import { HTMLElement, parse, TextNode } from 'node-html-parser';
import * as fs from 'fs';
import { parseMD } from "./markdown";
import { Structure, Pillar, Question, Choice, HelpfulResource, ImprovementPlan, RiskRule } from './Structure';
import { chatBot } from './chatbot';
import { stringify } from 'csv-stringify/sync';


async function main() {
  try {
    const mdStruct = parseMD("./lens.md")
    const root: HTMLElement = parse(mdStruct.md.body);

    // Read the markdown file

    // Search for assessment ttle
    const name = searchTitle(root);

    const description: string = searchDescription(root);

    const customLens = new Structure(name, description);

    browsePillarsAndQuestions(customLens, root)

    await useGenAIAndGenerateFile(customLens);
  } catch (error) {
    console.error(error);
  }
}

void main();

async function useGenAIAndGenerateFile(customLens: Structure): Promise<void> {
  try {
    await refineStructure(customLens);

    updateFile(customLens);

  } catch (error) {
    console.error(error);
  }
}

function updateFile(customLens: Structure) {
  fs.writeFileSync("customLens.json", JSON.stringify(customLens, null, 2));

  // Generates a CSV
  
  let content = "Pillar,Question ID,Question title, Explanation, Response, Comment, Allowed Answers\n";
  const lines = []
  for (let i = 0; i < customLens.pillars.length; i++) {
    const pillar = customLens.pillars[i];
    for (let j = 0; j < pillar.questions.length; j++) {
      const question = pillar.questions[j];
      lines.push([
        pillar.name,
        question.id,
        question.title,
        question.description,
        "",
        "",
        question.choices.map(choice => choice.title).join("\n")
      ])
    }
  }
  fs.writeFileSync("customLens.csv", content + csv_stringify(lines));
}

async function refineStructure(customLens: Structure) {
  const quality = +", the text must no be over 2048 characters, no HTML characters inside, and be expressed in a concised and intelligible way."
  console.log("Refining structure...");
  for (let i = 0; i < customLens.pillars.length; i++) {
    const pillar = customLens.pillars[i];
    console.log(`Processing pillar ${i + 1} of ${customLens.pillars.length}`);
    if (!pillar.description) {
      pillar.setDescription(await chatBot("Generates a description for the pillar of this assessment, the pillar theme is " + pillar.name + quality));
    }
    for (let j = 0; j < pillar.questions.length; j++) {
      const question = pillar.questions[j];
      console.log(`Processing question ${j + 1} of ${pillar.questions.length}`);
      //question.title = await chatBot("If necessary reformulate the question, to be easier to understand while keeping the meaning of the question. The question must end by a question mark. Here is the question " + question.title);
      if (!question.description || "N/A" === question.description) {
        question.setDescription(await chatBot("Generates a description for the question of this assessment, description (must be 1-2048 characters, allowed characters are A-Z, 0-9, a-z, - _ . , : / ( ) @ ! & # + ' and ’), the question is " + question.title + quality));
      }
      for (let k = 0; k < question.choices.length; k++) {
        const choice = question.choices[k];
        console.log(`Processing choice ${k + 1} of ${question.choices.length}`);
        let awsResource = await chatBot("Find an AWS helpful resource or webpage for the choice of this assessment, I want as an answer only an URL, the choice is " + choice.title + " and the original question " + question.title)
        let explanation = "";
        // If awsResource is not a valid URL, explanation is empty and awsResource is assigned a blank value
        if (awsResource.includes("http")) {
          explanation = await chatBot("Provides a short description of this page " + awsResource);
        } else {
          awsResource = "";
        }
        // Remove \n in awsResource
        awsResource = awsResource.replace(/\n/g, "");
        choice.helpfulResource = new HelpfulResource(
          explanation,
          awsResource
        );
        choice.improvementPlan = new ImprovementPlan(
          await chatBot("Provide an improvement plan only if needed when the answer is " + choice.title + " for the question " + question.title + ". If the answer does not require an imrpvement plan, return an empty string or return just the improvement plan that you propose.")
        );
        if (choice.helpfulResource && (!choice.helpfulResource.displayText || !choice.helpfulResource.url)) {
          choice.helpfulResource = undefined;
        }
      }

      const choiceMap = question.choices.map(choice => choice.id + " => " + choice.title).join("\n");
      /*
      let riskRule;
      if (question.choices.length === 2) {
        riskRule = await chatBot("Here is question is " + question.title + " and the choices are \n:" + choiceMap + "\n Here are two risks NO_RISK, MEDIUM_RISK. Use a combination of the choices with boolean operators  (all variables must be valid choice ids; allowed characters are A-Z, a-z, 0-9, _ ( ) && || and ! ) to evaluate each risk. The variables are boolean values.  Returns the answer as a JSON payload like { \"NO_RISK\" : \"formula\", \"MEDIUM_RISK\": \"formula\"}");
      } else {
        riskRule = await chatBot("Here is question is " + question.title + " and the choices are \n:" + choiceMap + "\n Here are three risks NO_RISK, MEDIUM_RISK and HIGH_RISK. Use a combination of the choices with boolean operators  (all variables must be valid choice ids; allowed characters are A-Z, a-z, 0-9, _ ( ) && || and ! ) to evaluate each risk.The variables are boolean values.  Returns the answer as a JSON payload like { \"NO_RISK\" : \"formula\", \"MEDIUM_RISK\": \"formula\", \"HIGH_RISK\": \"formula\"}");
      }
  
      const obj = JSON.parse(riskRule);
      question.riskRules = [];
      for (const [key, value] of Object.entries(obj)) {
        question.addRiskRule(new RiskRule(key, (value as string)));
      }
      */

      updateFile(customLens);

    }
  }
  console.log("Structure refined.");
}


function searchDescription(root: HTMLElement): string {
  let begin = false;
  let description = "";
  for (const childN of root.childNodes) {
    if (childN instanceof HTMLElement) {
      if (childN.rawTagName === 'h1') {
        begin = true;
        continue;
      }
      if (begin) {
        if (childN.rawTagName === 'h2') {
          break;
        }
        description += childN.toString();
      }
    }
  }
  return description;
}

function searchTitle(root: HTMLElement) {
  const h1 = root.querySelector("h1");
  const name = h1.childNodes[0].toString();
  return name;
}
function browsePillarsAndQuestions(customLens: Structure, root: HTMLElement) {
  let actualPillar: Pillar = new Pillar("undefined", "");
  let actualQuestion: Question | undefined = undefined;
  let description = "";
  for (const node of root.childNodes) {
    if (!(node instanceof HTMLElement)) {
      continue;
    }
    const helt: HTMLElement = node;
    if (helt.rawTagName === 'h2') {

      if (description && actualQuestion) { // Initializes the description
        actualQuestion.setDescription(description);
        description = "";
      }
      if (description && actualPillar) { // Initializes the description
        actualPillar.setDescription(description);
        description = "";
      }

      actualPillar = new Pillar(helt.childNodes[0].toString(), "");
      customLens.addPillar(actualPillar);
      actualQuestion = undefined;
    } else if (helt.rawTagName === 'h3') {
      if (description && actualQuestion) { // Initializes the description
        actualQuestion.setDescription(description);
        description = "";
      }
      if (description && actualPillar) { // Initializes the description
        actualPillar.setDescription(description);
        description = "";
      }
      let questionTitle = helt.childNodes[0].toString().trim();
      if (questionTitle.charAt(questionTitle.length - 1) !== '?') {
        questionTitle += "?";
      }
      actualQuestion = new Question(questionTitle)
      actualQuestion.addRiskRule(new RiskRule("NO_RISK", "default"));
      actualPillar?.addQuestion(actualQuestion);
    } else {
      if (helt.rawTagName === 'p') {
        description += helt.toString();
      } else if (helt.rawTagName === 'ul') {
        for (const child of helt.childNodes) {
          if (child instanceof HTMLElement) {
            if (child.rawTagName === 'li') {
              const choiceTitle = child.childNodes.map((c: any) => {
                if (c instanceof HTMLElement || c instanceof TextNode) {
                  return c.toString();
                } else {
                  return "";
                }
              }).join("");

              if (choiceTitle === "\n" || choiceTitle === "") {
                console.error("Problem with child : ", { text: choiceTitle, child });
                console.error("Problem with child : ", child.toString());
              }
              const choice = new Choice(choiceTitle, choiceTitle, new HelpfulResource("TBD", "http://"), new ImprovementPlan("TBD"));
              actualQuestion?.addChoice(choice);
            }
          }
        }
      }
    }
  }
  if (description && actualQuestion) { // Initializes the description
    actualQuestion.setDescription(description);
    description = "";
  }
  if (description && actualPillar) { // Initializes the description
    actualPillar.setDescription(description);
    description = "";
  }
  return description;
}

