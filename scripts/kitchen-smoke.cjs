/* Account-scoped workflow test. Removes only records belonging to its fixture accounts. */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const ts = require("typescript");
const dns = require("node:dns");
const mongoose = require("mongoose");
process.loadEnvFile();
const origin = process.env.TEST_APP_URL || "http://localhost:3001";
const tag = `kitchen_${crypto.randomBytes(5).toString("hex")}`;
const emails = [0, 1].map((i) => `${tag}_${i}@example.com`);
const userIds = [];
const password = crypto.randomBytes(8).toString("hex");
async function call(path, cookie, method = "GET", data) {
  const response = await fetch(origin + path, {
    method,
    headers: {
      ...(cookie ? { Cookie: cookie } : {}),
      ...(data !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
  });
  return { status: response.status, body: await response.json() };
}
async function account(index) {
  const registered = await call("/api/sign-up", null, "POST", {
    name: "Kitchen test",
    username: `${tag}_${index}`,
    email: emails[index],
    password,
  });
  assert.equal(registered.status, 201);
  const cookies = new Map();
  const capture = (r) =>
    r.headers.getSetCookie().forEach((cookie) => {
      const first = cookie.split(";")[0],
        at = first.indexOf("=");
      cookies.set(first.slice(0, at), first.slice(at + 1));
    });
  const header = () =>
    Array.from(cookies, ([name, value]) => `${name}=${value}`).join("; ");
  const csrf = await fetch(origin + "/api/auth/csrf");
  capture(csrf);
  const { csrfToken } = await csrf.json();
  const auth = await fetch(origin + "/api/auth/callback/credentials", {
    method: "POST",
    headers: {
      Cookie: header(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      csrfToken,
      identifier: emails[index],
      password,
      json: "true",
      callbackUrl: origin + "/dashboard",
    }),
  });
  capture(auth);
  const session = await call("/api/auth/session", header());
  assert.ok(session.body.user?._id);
  userIds.push(new mongoose.Types.ObjectId(session.body.user._id));
  return header();
}
function helpers() {
  const out = {};
  const code = ts.transpileModule(
    fs.readFileSync("src/types/recipeContent.ts", "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } },
  ).outputText;
  new Function("exports", code)(out);
  assert.equal(out.scaleQuantity(2, 4, 6), 3);
  assert.equal(out.scaleQuantity(0.001, 100, 1), 0.00001);
  assert.equal(out.scaleQuantity(null, 4, 6), null);
  assert.equal(
    out.formatIngredient({ name: "salt", quantity: null, unit: "" }, 2, 4),
    "As needed salt",
  );
  assert.equal(
    out.formatIngredient({ name: "rice", quantity: 0.001, unit: "g" }, 100, 1),
    "0.00001 g rice",
  );
  assert.notEqual(
    out.progressKey("recipe", ["step one"]),
    out.progressKey("recipe", ["step changed"]),
  );
}
(async () => {
  helpers();
  if (process.env.MONGODB_DNS_SERVERS) {
    const servers = process.env.MONGODB_DNS_SERVERS.split(",");
    dns.setServers(servers);
    dns.promises.setServers(servers);
  }
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 8000,
  });
  try {
    const owner = await account(0),
      other = await account(1);
    for (const path of ["/api/bookmarks", "/api/shopping-list"])
      assert.equal((await call(path)).status, 401);
    const recipe = {
      ingredients: [
        { name: `Lentils_${tag}`, quantity: 0.5, unit: "cup" },
        { name: "Salt", quantity: null, unit: "" },
      ],
      steps: ["Rinse lentils.", "Simmer for twenty minutes."],
      prepMinutes: 5,
      cookMinutes: 20,
      servings: 4,
      cuisine: "Indian",
      dietaryTags: ["Vegan"],
      category: "Everyday",
    };
    const payload = { title: `${tag} Chocolate cake`, bodyOfBlog: "", recipe };
    for (const invalid of [
      { ...recipe, servings: 0 },
      { ...recipe, steps: [] },
      {
        ...recipe,
        ingredients: [{ name: "Lentils", quantity: -1, unit: "g" }],
      },
    ])
      assert.equal(
        (
          await call("/api/post-blog", owner, "POST", {
            ...payload,
            recipe: invalid,
          })
        ).status,
        400,
      );
    const created = await call("/api/post-blog", owner, "POST", payload);
    assert.equal(created.status, 200, created.body.message);
    const id = created.body.id;
    assert.ok(id);
    const detail = await call(`/api/get-individual-blogs?id=${id}`);
    assert.deepEqual(detail.body.data.recipe, recipe);
    const filtered = async (extra) =>
      (
        await call(
          "/api/get-all-blogs?" + new URLSearchParams({ q: tag, ...extra }),
        )
      ).body.data;
    assert.equal(
      (
        await filtered({
          cuisine: "Indian",
          diet: "Vegetarian",
          maxMinutes: "30",
        })
      ).length,
      1,
    );
    assert.equal((await filtered({ cuisine: "Italian" })).length, 0);
    assert.equal((await filtered({ maxMinutes: "10" })).length, 0);
    assert.equal(
      (await filtered({ category: "Sweet treats" })).length,
      0,
      "Structured data takes priority over title guesses",
    );
    assert.equal(
      (
        await call(
          "/api/get-all-blogs?" + new URLSearchParams({ q: `Lentils_${tag}` }),
        )
      ).body.data.length,
      1,
      "Ingredient search finds the recipe",
    );
    const legacy = await call("/api/post-blog", owner, "POST", {
      title: `${tag} Garden salad`,
      bodyOfBlog: "A legacy recipe with a story and freeform instructions.",
    });
    assert.equal(legacy.status, 200);
    const legacyId = legacy.body.id;
    assert.equal((await filtered({ category: "Vegetarian" })).length, 2);
    for (const recipeId of [id, legacyId, id])
      assert.equal(
        (await call("/api/bookmarks", owner, "POST", { recipeId, saved: true }))
          .status,
        200,
      );
    const first = await call("/api/bookmarks?limit=1", owner);
    assert.equal(first.body.data.length, 1);
    assert.equal(first.body.pagination.hasMore, true);
    const second = await call(
      "/api/bookmarks?" +
        new URLSearchParams({
          limit: "1",
          cursor: first.body.pagination.nextCursor,
        }),
      owner,
    );
    assert.equal(second.body.data.length, 1);
    assert.equal(second.body.pagination.hasMore, false);
    const saved = [...first.body.data, ...second.body.data];
    assert.equal(new Set(saved.map((item) => item._id)).size, 2);
    assert.equal(saved.find((item) => item._id === legacyId).recipe, undefined);
    assert.equal((await call("/api/bookmarks", other)).body.data.length, 0);
    assert.equal(
      (await call(`/api/bookmarks?recipeId=${id}`, owner)).body.saved,
      true,
    );
    assert.equal(
      (await call(`/api/bookmarks?recipeId=${id}`, other)).body.saved,
      false,
    );
    assert.equal(
      (
        await call("/api/shopping-list", owner, "POST", {
          recipeId: legacyId,
          servings: 6,
        })
      ).status,
      400,
    );
    for (let i = 0; i < 2; i++)
      assert.equal(
        (
          await call("/api/shopping-list", owner, "POST", {
            recipeId: id,
            servings: 6,
          })
        ).status,
        200,
      );
    let shopping = (await call("/api/shopping-list", owner)).body.data;
    assert.equal(shopping.length, 1);
    let group = shopping[0];
    assert.equal(group.items[0].quantity, 0.75);
    assert.equal(group.items[1].quantity, null);
    assert.equal((await call("/api/shopping-list", other)).body.data.length, 0);
    const check = {
      groupId: group._id,
      itemId: group.items[0]._id,
      checked: true,
    };
    assert.equal(
      (await call("/api/shopping-list", other, "PATCH", check)).status,
      404,
    );
    assert.equal(
      (await call("/api/shopping-list", owner, "PATCH", check)).status,
      200,
    );
    assert.equal(
      (await call("/api/shopping-list", owner)).body.data[0].items[0].checked,
      true,
    );
    assert.equal(
      (await call(`/api/update-blog?id=${id}`, other, "POST", payload)).status,
      404,
    );
    assert.equal(
      (
        await call(`/api/update-blog?id=${id}`, owner, "POST", {
          ...payload,
          recipe: {
            ...recipe,
            ingredients: [{ name: "Rice", quantity: 2, unit: "cup" }],
          },
        })
      ).status,
      200,
    );
    assert.equal(
      (await call("/api/shopping-list", owner)).body.data[0].items[0].quantity,
      0.75,
      "Shopping list is a stable snapshot until updated",
    );
    await call("/api/shopping-list", owner, "POST", {
      recipeId: id,
      servings: 8,
    });
    shopping = (await call("/api/shopping-list", owner)).body.data;
    assert.equal(shopping.length, 1);
    group = shopping[0];
    assert.equal(group.items[0].quantity, 4);
    assert.equal(group.items[0].checked, false);
    assert.equal(
      (await call(`/api/shopping-list?id=${group._id}`, other, "DELETE"))
        .status,
      404,
    );
    assert.equal(
      (await call(`/api/shopping-list?id=${group._id}`, owner, "DELETE"))
        .status,
      200,
    );
    assert.equal((await call("/api/shopping-list", owner)).body.data.length, 0);
    const side = await call("/api/post-blog", owner, "POST", {
      ...payload,
      title: `${tag} Side dish`,
    });
    assert.equal(side.status, 200);
    for (const recipeId of [id, side.body.id])
      assert.equal(
        (
          await call("/api/shopping-list", owner, "POST", {
            recipeId,
            servings: 4,
          })
        ).status,
        200,
      );
    const cartFirst = await call("/api/shopping-list?limit=1", owner);
    assert.equal(cartFirst.body.data.length, 1);
    assert.equal(cartFirst.body.pagination.hasMore, true);
    const cartSecond = await call(
      "/api/shopping-list?" +
        new URLSearchParams({
          limit: "1",
          cursor: cartFirst.body.pagination.nextCursor,
        }),
      owner,
    );
    assert.equal(cartSecond.body.data.length, 1);
    assert.equal(cartSecond.body.pagination.hasMore, false);
    assert.notEqual(cartFirst.body.data[0]._id, cartSecond.body.data[0]._id);
    const searched = await call("/api/search-blog", null, "POST", {
      searchWord: tag,
      cuisine: "Indian",
      diet: "Vegan",
      maxMinutes: 30,
    });
    assert.equal(searched.status, 200);
    assert.equal(searched.body.data.length, 2);
    await call("/api/bookmarks", owner, "POST", {
      recipeId: legacyId,
      saved: false,
    });
    assert.equal((await call("/api/bookmarks", owner)).body.data.length, 1);
    await call(`/api/delete-blog?id=${id}`, owner, "DELETE");
    assert.equal(
      (await call("/api/bookmarks", owner)).body.data.length,
      0,
      "Deleted recipes do not appear in saved collections",
    );
    assert.equal(
      (
        await call("/api/shopping-list", owner, "POST", {
          recipeId: legacyId,
          servings: 0,
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await call("/api/bookmarks", owner, "POST", {
          recipeId: "invalid",
          saved: true,
        })
      ).status,
      400,
    );
    console.log(
      "PASS: structured recipe validation/round-trip, ingredient and metadata search, legacy compatibility, serving precision, idempotent bookmarks/lists, pagination, shopping snapshots/checks, deletion, and account isolation.",
    );
  } finally {
    for (const collection of ["bookmarks", "shoppinggroups"])
      await mongoose.connection.db
        .collection(collection)
        .deleteMany({ userId: { $in: userIds } });
    await mongoose.connection.db
      .collection("blogs")
      .deleteMany({ ownedById: { $in: userIds } });
    await mongoose.connection.db
      .collection("users")
      .deleteMany({ email: { $in: emails } });
    await mongoose.disconnect();
  }
})().catch((error) => {
  console.error("FAIL:", error.stack || error.message);
  process.exitCode = 1;
});
