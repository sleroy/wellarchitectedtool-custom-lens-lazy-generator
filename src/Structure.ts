import { htmlToText } from 'html-to-text';


export class Structure {
  public schemaVersion = "2021-11-01";
  public name: string;
  public description: string;
  public pillars: Pillar[];

  constructor(name: string, description: string, pillars: Pillar[] = []) {
    this.name = name;
    this.description = htmlToText(description, {
      wordwrap: 130
    });
    this.pillars = pillars;
  }

  addPillar(pillar: Pillar) {
    this.pillars.push(pillar);
  }
}

export class Pillar {
  public id: string;
  public name: string;
  public description: string;
  public questions: Question[] = [];

  constructor(name: string, description: string) {
    // Generates an ID from the name in uppercase, no strange character and no space
    this.id = name.replace(/\s/g, '').toUpperCase();
    this.name = name;
    this.questions = [];
    this.description = description || "";
  }

  public setDescription(desc: string) {
    this.description = htmlToText(desc, {
      wordwrap: 130
    });
  }

  addQuestion(question: Question) {
    this.questions.push(question);
    // Generate an ID using the pillar id and a number representing the order of the question in the array
    question.id = this.id + "_" + this.questions.length;
  }
}
export class HelpfulResource {
  displayText: string;
  url: string;
  constructor(displayText: string, url: string) {
    this.displayText = displayText;
    this.url = url;
  }
}
export class ImprovementPlan {
  displayText: string;
  constructor(displayText: string) {
    this.displayText = displayText;
  }
}
export class Choice {
  id: string;
  title: string;
  helpfulResource: HelpfulResource | undefined;
  improvementPlan: ImprovementPlan | undefined;

  constructor(id: string, title: string, helpfulResource: HelpfulResource | undefined, improvementPlan: ImprovementPlan | undefined) {
    this.id = id;
    this.title = htmlToText(title, {
      wordwrap: 130
    });
    this.helpfulResource = helpfulResource;
    this.improvementPlan = improvementPlan;
  }
}
export class RiskRule {
  condition: string;
  risk: string;
  constructor(risk: string, condition: string) {
    this.condition = condition;
    this.risk = risk;
  }
}

export class Question {
  public id = "";
  public title = "";
  public description = "N/A";
  public choices: Choice[] = [];
  public riskRules: RiskRule[] = [];


  constructor(title: string) {
    // Generate unique simple ID from the title without spaces, capital letters
    this.id = title.replace(/\s/g, '').toUpperCase();
    this.title = htmlToText(title, {
      wordwrap: 130
    });;
  }

  public setDescription(desc: string) {
    this.description = htmlToText(desc, {
      wordwrap: 130
    });
  }

  public addChoice(choice: Choice) {
    choice.id = this.id + "_" + this.choices.length;
    this.choices.push(choice);
  }

  public addRiskRule(riskRule: RiskRule) {
    this.riskRules.push(riskRule);
  }
}
