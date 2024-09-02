import whichIndexesIncorrect from "@/lib/whichIndexesIncorrect";
import { server, unauthorized } from "@/lib/apiErrorResponses";
import stringCompare from "@/lib/stringCompare";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { getQuizzesById, getUserQuizzes, addError } from "@/lib/db/helpers";
import { db } from "@/lib/db/db.js";
import { htmlDate } from "@/lib/date";

export async function POST(req, { params }) {
    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        const { _id } = params;
        const { userResponse } = await req.json();

        const quiz = (await getQuizzesById({ id: _id }))[0];

        if (!quiz) {
            return NextResponse.json(
                {
                    message: `Quiz with id ${_id} could not be found`,
                },
                { status: 404 },
            );
        }

        let isCorrect;
        let incorrectIndexes;

        if (quiz.type === "prompt-response") {
            let incorrect = quiz.correctResponses.find(
                (x) => stringCompare(x, userResponse) >= 0.8,
            );
            isCorrect = incorrect !== undefined;
        }

        if (quiz.type === "multiple-choice") {
            let incorrect = quiz.correctResponses.find(
                (x) => x === userResponse,
            );
            isCorrect = incorrect !== undefined;
        }

        if (
            [
                "ordered-list-answer",
                "unordered-list-answer",
                "fill-in-the-blank",
                "verbatim",
            ].includes(quiz.type)
        ) {
            incorrectIndexes = whichIndexesIncorrect(
                userResponse,
                quiz.correctResponses,
                quiz.type !== "unordered-list-answer",
            );
            isCorrect = incorrectIndexes.length === 0;
        }

        let quizInUser = (await getUserQuizzes(user.id)).find(
            (x) => x.quizId === quiz.id,
        );
        console.log("USER QUIZ", quizInUser);
        let canProgressLevel = false;
        if (!quizInUser) {
            canProgressLevel = true;
            quizInUser = {
                quizId: quiz.id,
                level: 0,
                hiddenUntil: new Date(),
            };
        } else {
            canProgressLevel = Date.now() > quizInUser.hiddenUntil.getTime();
        }
        if (isCorrect && canProgressLevel) {
            let hiddenUntil = new Date();
            quizInUser.lastCorrect = new Date();
            quizInUser.level += 1;
            quizInUser.hiddenUntil = hiddenUntil.setDate(
                hiddenUntil.getDate() + quizInUser.level,
            );
        } else if (isCorrect) {
            quizInUser.lastCorrect = new Date();
        } else {
            quizInUser.lastCorrect = 0;
            quizInUser.level = quizInUser.level > 0 ? quizInUser.level - 1 : 0;
        }

        if (quizInUser.id) {
            const [results, fields] = await db
                .promise()
                .query(
                    "UPDATE `UserQuizzes` SET `lastCorrect` = ?, `level` = ?, `hiddenUntil` = ? WHERE `id` = ?",
                    [
                        htmlDate(quizInUser.lastCorrect) === "Not yet"
                            ? 0
                            : htmlDate(quizInUser.lastCorrect),
                        quizInUser.level,
                        htmlDate(quizInUser.hiddenUntil) === "Not yet"
                            ? 0
                            : htmlDate(quizInUser.hiddenUntil),
                        quizInUser.id,
                    ],
                );

            console.log("RESULTS", results);
        } else {
            await db
                .promise()
                .query(
                    "INSERT INTO UserQuizzes (`userId`, `quizId`, `lastCorrect`, `level`, `hiddenUntil`) VALUES (?, ?, ?, ?, ?)",
                    [
                        user.id,
                        quiz.id,
                        htmlDate(quizInUser.lastCorrect) === "Not yet"
                            ? 0
                            : htmlDate(quizInUser.lastCorrect),
                        quizInUser.level,
                        htmlDate(quizInUser.hiddenUntil) === "Not yet"
                            ? 0
                            : htmlDate(quizInUser.hiddenUntil),
                    ],
                );
        }

        return NextResponse.json({
            message: {
                isCorrect,
                incorrectIndexes,
                user,
                quiz: quizInUser,
            },
        });
    } catch (error) {
        console.error(`[Quiz] POST error:\n ${error}`);
        addError(error, "/api/quiz/[_id]: POST");
        return server;
    }
}

export async function DELETE(req, { params }) {
    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        const { _id } = params;

        const quiz = (await getQuizzesById({ id: _id }))[0];
        if (!quiz) {
            return NextResponse.json(
                {
                    message: `Quiz with id ${_id} could not be found`,
                },
                { status: 404 },
            );
        }

        const isCreator =
            (quiz.createdBy && quiz.createdBy == user.id) ||
            (quiz.creator && quiz.creator.id == user.id);

        if (!isCreator) {
            return NextResponse.json(
                {
                    message: `User ${user.id} is not authorized to delete quiz with id ${_id}. Only the creator ${quiz.creator.id} is permitted`,
                },
                { status: 403 },
            );
        }

        const [deletion, fields] = await db
            .promise()
            .query("DELETE FROM `Quizzes` WHERE `id` = ?", [_id]);
        if (deletion.affectedRows === 0) {
            console.error(`Unable to delete quiz with id ${_id}`);
            addError(
                {
                    stack: deletion,
                    message: `Unable to delete quiz with id ${_id}`,
                },
                "/api/quiz/[_id]: POST",
            );

            return NextResponse.json(
                {
                    message: `Unable to delete quiz with id ${_id}`,
                },
                { status: 500 },
            );
        }
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error(`[Quiz] DELETE error:\n ${error}`);
        addError(error, "/api/quiz/[_id]: DELETE");
        return server;
    }
}
