const openAI = require("openai");
const nodemailer = require("nodemailer");
const { openaiApiKey } = require("../config");

const openaiPrompt = new openAI({ apiKey: openaiApiKey });

async function generateSOP(data) {
  const {
    name,
    age,
    education,
    admissionToCollege,
    programInCanada,
    countryOfOrigin,
    futureGoals,
    englishScores,
    paidFirstYear,
    paidGIC,
    tuitionFee,
    paidTowardsGIC,
  } = data;

  const prompt = `
    Write a compelling Statement of Purpose for ${name}, an applicant from ${countryOfOrigin},
    applying to the ${programInCanada} program at ${admissionToCollege}.
    ${name} is ${age} years old and holds a degree in ${education}.
    They are passionate about ${programInCanada} and have a strong desire to work in AI research. Their future goal is to ${futureGoals}.
    Their English proficiency scores are: 
    - Listening: ${englishScores.listening}
    - Speaking: ${englishScores.speaking}
    - Writing: ${englishScores.writing}
    - Reading: ${englishScores.reading}
    ${name} has ${
    paidFirstYear ? "paid" : "not paid"
  } their first-year tuition fee of ${tuitionFee}.
    They have also ${
      paidGIC ? "paid" : "not paid"
    } towards the GIC, contributing ${paidTowardsGIC}.
    `;

  try {
    const response = await openaiPrompt.completions.create({
      prompt,
      max_tokens: 400,
      "model":"text-davinci-002",
    });
    const generatedSOP = response.choices[0].text.trim();
    return generatedSOP;
  } catch (error) {
    console.error("Error generating SOP with OpenAI:", error);
    return null; // Return null to indicate fallback generation is needed
  }
}

// Configure nodemailer
const transporter = nodemailer.createTransport({
    service:"gmail",
    auth: {
        user: 'bindusrim29@gmail.com',
        pass: 'xvwxteufeqtciqmg'
    }
});

async function generateAndSendSOP(req, res) {
  const {
    name,
    email: recipientEmail,
    age,
    education,
    admissionToCollege,
    programInCanada,
    countryOfOrigin,
    futureGoals,
    englishScores,
    paidFirstYear,
    paidGIC,
    tuitionFee,
    paidTowardsGIC,
  } = req.body;

  // Validate required fields
  if (
    !name ||
    !recipientEmail ||
    !education ||
    !admissionToCollege ||
    !programInCanada ||
    !futureGoals
  ) {
    return res
      .status(400)
      .json({ error: "Missing required fields in the request body." });
  }

  let sop = await generateSOP({
    name,
    age,
    education,
    admissionToCollege,
    programInCanada,
    countryOfOrigin,
    futureGoals,
    englishScores,
    paidFirstYear,
    paidGIC,
    tuitionFee,
    paidTowardsGIC,
  });

  if (!sop) {
    // Fallback SOP generation using the same prompts
    sop = `
    Dear admissions committee,\n\n
    My name is ${name}, and I am writing to express my strong interest in the ${programInCanada} program at your institution.
    I am ${age} years old, and I come from ${countryOfOrigin}. I hold a degree in ${education},
    and my future goal is to ${futureGoals}. I have a strong proficiency in English with scores of:
    - Listening: ${englishScores.listening}
    - Speaking: ${englishScores.speaking}
    - Writing: ${englishScores.writing}
    - Reading: ${englishScores.reading}
    I have ${
      paidFirstYear ? "paid" : "not paid"
    } the first-year tuition fee of ${tuitionFee},
    and I have also ${
      paidGIC ? "paid" : "not paid"
    } towards the GIC, contributing ${paidTowardsGIC}.
    Thank you for considering my application. I look forward to the opportunity to join your program
    and make a meaningful impact.\n\n
    Sincerely,\n${name}
  `;
  }

  const mailOptions = {
    from: "bindusri29@gmail.com", // Sender's email address
    to: recipientEmail, // Recipient's email address
    subject: "Statement of Purpose",
    text: sop,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: "SOP sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res
      .status(500)
      .json({ error: "An error occurred while sending the email." });
  }
}

module.exports = {
  generateAndSendSOP,
};
