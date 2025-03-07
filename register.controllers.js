import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const registerSchema = z.object({
  firstname: z.string().min(3, "Please enter valid name."),
  lastname: z.string().min(3, "Plaese enter valid name."),
  email: z.string().email("Please enter a valid Email address."),
  password: z.string(),
});

export const registerUser = async (req, reply) => {
  try {
    const registerData = registerSchema.parse(req.body);

    const hashedPassword = await bcrypt.hash(registerData.password, 10);

    //Checks for existing user to avoid duplicates.
    const existingUser = await prisma.user.findUnique({
      where: { email: registerData.email },
    });

    if (existingUser) {
      reply.status(400).send({ message: "Email address in use." });
    }

    //Creates user account
    const register = await prisma.user.create({
      data: {
        firstname: registerData.firstname,
        lastname: registerData.lastname,
        email: registerData.email,
        password: hashedPassword,
      },
    });

    reply.status(200).send({
      message: "Account created successfully.",
      user: {
        id: register.userId,
        firstname: register.firstname,
        lastname: register.lastname,
        email: register.email,
      },
    });
  } catch (error) {
    console.error("Error: ", error);
    if (error instanceof z.ZodError) {
      return reply.status(400).send({ error: error.errors });
    }
    reply
      .status(500)
      .send({ message: "Error in creating an account. Please try again." });
  }
};
