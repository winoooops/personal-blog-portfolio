---
title: "Book Notes: A Philosophy of Software Design"
tag: Notes
date: 2026-05-16
readMin: 25
dek: My working notes on John Ousterhout's book — complexity, deep modules, error design, comments, and what strategic programming means in an age of AI coding agents.
source: local
---

> **Author:** John Ousterhout (Stanford University)  
> **Edition:** 2nd Edition (2021)  
> **Official:** [Book Website](https://web.stanford.edu/~ouster/cgi-bin/book.php)  
> **Chinese Translation:** [go7hic.github.io](https://go7hic.github.io/A-Philosophy-of-Software-Design/)

I had seen this book referenced many times before, but it never quite made it to the top of my reading list. That changed after Matt Pocock's talk ["Software Fundamentals Matter More Than Ever"](https://www.youtube.com/watch?v=v4F1gFy-hqg). I ended up reading the book twice. This note is my attempt to extract the principles I found most useful, organized by concept rather than by chapter.

---

## Core Concept: Complexity

### The Central Problem

Here is a claim that I think is underappreciated: the bottleneck in software engineering has almost never been hardware. The real constraint is cognitive. Human working memory is finite, and as systems grow, the ability of any individual developer to hold the full structure in their head becomes the binding limitation.

Ousterhout defines **complexity** not as some aesthetic property visible to the original author, but as the confusion it generates in its readers. It is, in a sense, the entropy of software. It accumulates incrementally, often silently, and compounds in ways that can render a codebase ungovernable before anyone notices.

What is interesting, and perhaps not immediately obvious, is that the major methodological movements of the last half-century are less competing ideologies than different thermostats pointed at the same fire:

- **Waterfall** attempts to suppress complexity by front-loading uncertainty into exhaustive design documents.
- **Agile** tries to contain it by shrinking the batch size of changes so that feedback loops catch dependency traps before they crystallize.
- **BDD** attacks it at the source, forcing stakeholders to resolve ambiguities in requirements before they become expensive architectural mistakes.
- **TDD** provides a safety net that makes refactoring (the primary tool for active complexity reduction) economically viable.
- **Object-oriented programming** offers encapsulation as a mechanism for information hiding, though its implementation inheritance often accidentally creates more coupling than it removes.
- **Layered architectures and design patterns** provide reusable vocabularies for separation of concerns, even if their over-application can introduce indirection where simplicity would suffice.
- **Microservices**, for all their operational overhead, are fundamentally a bet that organizational boundaries can firewall complexity better than modular boundaries within a monolith.

They disagree on tactics, but they agree on the enemy.

### Three Symptoms

It is tempting to treat complexity as a vague aesthetic complaint ("this code is messy"). Ousterhout argues it is better understood as a diagnosable condition with three specific symptoms:

- **Change amplification** — a seemingly trivial modification ripples outward and demands edits across dozens of files, as if the codebase were a tightly stretched drum rather than a collection of independent parts.
- **Cognitive load** — the sheer volume of information a developer must hold in working memory to make even a minor change. Every extra concept a module forces into the reader's head is a small tax that compounds into paralysis.
- **Unknown unknowns** — situations where you do not merely lack knowledge, but lack awareness that the knowledge is missing at all. You change one thing, and something breaks three layers away, in a module you did not even know existed.

Of the three, I would argue that unknown unknowns are the most dangerous. At least with the first two symptoms, you know what you are up against.

### Two Root Causes

> - **Dependencies** — coupling between modules. Not inherently evil, but must be *visible* and *simple*.
> - **Obscurity** — hidden side effects. The signature says the function only reads; the implementation writes to global state, mutates shared variables, or rebuilds the DOM. You will not know until you read every line, and by then the damage is done.

### Code Example: Todo-list

A concrete example using a minimal Todo-list in TypeScript illustrates the difference between visible, manageable dependencies and the hidden damage of obscurity.

**❌ Bad design: obscure dependencies and hidden side effects**

```typescript
// Hidden global state — anyone can mutate it, nowhere is it declared
let todos: any[] = [];

// TodoItem secretly knows about HTML rendering
class TodoItem {
  constructor(public text: string, public done: boolean) {}
  render() {
    return `<li class="${this.done ? 'done' : ''}">${this.text}</li>`;
  }
}

// addTodo claims to need only a string, but secretly touches
// localStorage, the DOM, and an undefined updateStats()
function addTodo(text: string) {
  const todo = new TodoItem(text, false);
  todos.push(todo);
  localStorage.setItem('todos', JSON.stringify(todos));
  document.getElementById('list')!.innerHTML = todos.map(t => t.render()).join('');
  updateStats(); // where is this defined? what does it touch?
}

// Magic number scattered in code — why 10? where else is it hard-coded?
function checkLimit() {
  if (todos.length > 10) alert('Too many!');
}

// A validator that lies about its contract: it mutates global state
function validateTodo(text: string): boolean {
  if (text.length > 0) {
    (window as any).lastValidationTime = Date.now();
    return true;
  }
  return false;
}
```

*Why this is bad, analyzed through dependencies, obscurity, and side effects:*

> The easiest way to understand obscurity is to think about side effects. A function's signature is a contract: it tells you what the function needs and what it returns. Obscurity is when that contract lies. `validateTodo` secretly writes to `window`. `addTodo` silently rebuilds the entire DOM. A global variable changes value because someone three files away called a method that looked harmless. The signature promised a read-only operation; the implementation performed a write. I would argue that this is the defining characteristic of obscurity: the visible interface says one thing, and the hidden side effects do another.

- **`let todos: any[]`** — **Obscurity + hidden side effect.** It is a global variable tucked in a corner; any file in the program can mutate it, and a reader has no way to know who does.
- **`TodoItem.render()`** — **Dependency + obscurity.** A data class now depends on HTML format. If the UI framework changes, you must open and edit `TodoItem`. The dependency exists but is not obvious from the class name.
- **`addTodo(text)`** — **Obscurity through hidden side effects and hidden dependencies.** The signature claims it only needs a string, but it secretly touches `localStorage`, the DOM, and an undefined `updateStats()`. The caller cannot see any of this; the function performs five operations while pretending to do one.
- **`> 10`** — **Obscurity.** A magic number with no name and no single source of truth. If the product team later says the limit is 20, you must grep the entire codebase hoping to catch every instance.
- **`validateTodo`** — **Obscurity through a lying side effect.** The function name promises validation (a read-only operation), yet it mutates `window.lastValidationTime`. The caller receives a boolean and never suspects the global state has changed.

**✅ Better design: explicit dependencies, no hidden information**

```typescript
// Configuration lives in one visible place
const CONFIG = { MAX_TODOS: 10, STORAGE_KEY: 'todos' } as const;

// Pure data shape — knows nothing about UI or storage
interface Todo { id: string; text: string; done: boolean; }

// Dependencies are declared as interfaces: obvious and swappable
interface Storage { save(todos: Todo[]): void; load(): Todo[]; }
interface Renderer { render(todos: Todo[]): void; }
interface Notifier { notify(message: string): void; }

class LocalStorage implements Storage {
  constructor(private key: string) {}
  save(todos: Todo[]) {
    localStorage.setItem(this.key, JSON.stringify(todos));
  }
  load(): Todo[] {
    const raw = localStorage.getItem(this.key);
    return raw ? JSON.parse(raw) : [];
  }
}

class DomRenderer implements Renderer {
  constructor(private containerId: string) {}
  render(todos: Todo[]) {
    const html = todos.map(t => 
      `<li class="${t.done ? 'done' : ''}">${t.text}</li>`
    ).join('');
    document.getElementById(this.containerId)!.innerHTML = html;
  }
}

// TodoService declares every dependency in its constructor.
// There are no surprises: you know exactly what it needs to run.
class TodoService {
  private todos: Todo[];
  constructor(
    private storage: Storage,
    private renderer: Renderer,
    private notifier: Notifier
  ) {
    this.todos = this.storage.load();
  }

  addTodo(text: string): { success: boolean; error?: string } {
    if (this.todos.length >= CONFIG.MAX_TODOS) {
      this.notifier.notify(`Maximum ${CONFIG.MAX_TODOS} todos allowed.`);
      return { success: false, error: 'LIMIT_EXCEEDED' };
    }
    const todo: Todo = {
      id: Math.random().toString(36).slice(2), text, done: false
    };
    this.todos.push(todo);
    this.storage.save(this.todos);
    this.renderer.render(this.todos);
    return { success: true };
  }
}

// Validation is a pure function: no hidden side effects, everything is in the return type
function validateTodo(text: string): { valid: boolean; reason?: string } {
  if (text.trim().length === 0) {
    return { valid: false, reason: 'EMPTY_TEXT' };
  }
  return { valid: true };
}

// Usage: every dependency is visible at the call site
const service = new TodoService(
  new LocalStorage(CONFIG.STORAGE_KEY),
  new DomRenderer('list'),
  { notify: msg => alert(msg) }
);
```

*Why this is better, and how each change attacks dependencies, obscurity, and side effects:*

- **`const CONFIG`** — **Removes obscurity.** `MAX_TODOS` and `STORAGE_KEY` live in one visible place. There are no magic numbers; the policy is named and centralized.
- **`interface Todo`** — **Removes dependency.** It is pure data. It knows nothing about HTML, localStorage, or business rules. The shape is obvious and framework-agnostic.
- **`Storage`, `Renderer`, `Notifier` interfaces** — **Make dependencies visible.** Before, `addTodo` reached into `localStorage` and `document` without announcement. Now the service announces exactly what it needs in its constructor, and those needs are expressed as contracts (interfaces) rather than hard-wired implementations.
- **`TodoService`** — **A deep module that hides complexity.** From the outside, a developer calls `addTodo(text)` and receives a result. They do not need to know that `LocalStorage` serializes to JSON, that `DomRenderer` rebuilds innerHTML, or that `Notifier` triggers an alert. The nitty-gritty is hidden behind a simple interface.
- **`TodoService` constructor + methods** — **Side effects are explicit and intentional.** `save()`, `render()`, and `notify()` are called deliberately inside the method body. A reader can trace every external interaction in one screen; nothing is smuggled through globals or implicit calls.
- **`validateTodo` as a pure function** — **Eliminates obscurity and hidden side effects.** The signature promises a result object, and it delivers exactly that. It does not touch global state, the DOM, or any external system. What you see is what it does.

A reasonable objection at this point is that `TodoService.addTodo` still appears to do quite a lot. It checks limits, generates IDs, pushes to an array, saves, renders, and notifies — six operations in one method. Is this not just complexity moved around rather than reduced? One could argue that we have merely traded scattered global functions for a bloated class.

I would argue that this misses the distinction between *internal* complexity and *interface* complexity. As systems grow, some amount of complicated logic is inevitable; the question is who pays the cost. In the bad design, every caller of `addTodo` paid the cost of hidden side effects and implicit dependencies. In the better design, the caller pays almost nothing: they pass a string and receive a result object. The messy orchestration — storage serialization, DOM reconciliation, notification dispatch — still exists, but it is the *module's* burden, not the *user's*. This is precisely what Ousterhout means when he says that deep modules prevail over shallow ones: a simple interface hiding substantial functionality. We will explore this idea in depth next.

---

## Deep Modules

### The Case for Larger Modules

One of the more counter-intuitive arguments in Ousterhout's book is that deep modules — modules with simple interfaces but substantial internal functionality — are often *larger* than conventional wisdom suggests. I would argue that this is the book's most important practical insight, and it runs directly against the prevailing Clean Code orthodoxy that tells us to split code into as many small classes as possible.

### Temporal Decomposition: Shallow by Chronology

The conventional view holds that a module should do one thing and do it well, which often gets interpreted as "make everything small." But Ousterhout observes that this interpretation frequently leads to shallow modules: classes with complex interfaces and minimal functionality. Consider what happens when we decompose a todo system by temporal sequence — step A, then step B, then step C. We end up with `TodoValidator`, `TodoSorter`, `TodoRenderer`, and `TodoPersister`:

```typescript
class TodoValidator {
  validate(todo: Todo): boolean {
    return todo.text.trim().length > 0;
  }
}

class TodoSorter {
  sort(todos: Todo[]): Todo[] {
    return [...todos].sort((a, b) => a.text.localeCompare(b.text));
  }
}

class TodoRenderer {
  render(todos: Todo[]): string {
    return todos.map(t => `<li>${t.text}</li>`).join('');
  }
}

class TodoPersister {
  save(todos: Todo[]) {
    localStorage.setItem('todos', JSON.stringify(todos));
  }
}

// The caller must know the exact sequence and wire everything together
function addTodo(text: string) {
  const todo = { id: generateId(), text, done: false };

  const validator = new TodoValidator();
  if (!validator.validate(todo)) throw new Error('Invalid');

  const persister = new TodoPersister();
  const existing = JSON.parse(localStorage.getItem('todos') || '[]');
  existing.push(todo);

  const sorter = new TodoSorter();
  const sorted = sorter.sort(existing);

  const renderer = new TodoRenderer();
  document.getElementById('list')!.innerHTML = renderer.render(sorted);

  persister.save(sorted);
}
```

Each class does almost nothing, yet the reader must understand four interfaces, their initialization order, and their data contracts. `TodoPersister` must know that `TodoSorter` has already run; `TodoRenderer` must know the exact shape of the sorted array. This is **temporal decomposition** in action: the modules are organized by chronological order rather than by information hiding. The complexity has not been reduced; it has been displaced into the gaps between modules, and into the orchestration code that the caller must now maintain.

### Deep Module in Practice: TodoService

A deeper — and arguably better — design lifts those operations into a single self-contained module. Instead of scattering the todo lifecycle across five small classes, you create one `TodoService` that hides validation, storage, rendering, and notification behind a single `addTodo(text)` call:

```typescript
class TodoService {
  constructor(
    private storage: Storage,
    private renderer: Renderer,
    private notifier: Notifier
  ) {}

  addTodo(text: string): { success: boolean; error?: string } {
    if (text.trim().length === 0) {
      return { success: false, error: 'INVALID' };
    }

    const todo: Todo = { id: generateId(), text, done: false };
    const todos = [...this.storage.load(), todo];
    const sorted = todos.sort((a, b) => a.text.localeCompare(b.text));

    this.storage.save(sorted);
    this.renderer.render(sorted);
    this.notifier.notify(`Added: ${text}`);

    return { success: true };
  }
}
```

The internal logic is still complex — it validates, generates IDs, persists state, sorts, updates the UI, and notifies — but that complexity is the module's private burden. The consumer pays only the cognitive cost of the interface (`addTodo(text)`), not the implementation. `TodoService` has replaced temporal decomposition with information hiding: the secret it keeps is "how a todo is added end-to-end," and it owns that entire pipeline.

### Interface Generality: Special vs General-Purpose

There is also a tension here with interface generality. A special-purpose `DomRenderer` that hard-codes an HTML template for todos is shallow: it solves one problem and forces you to write a new renderer for every list type. A general-purpose `ListRenderer` deepens the module by accepting any array and a formatting function:

```typescript
// Special-purpose: shallow, tied to one data type and one template
class DomRenderer {
  constructor(private containerId: string) {}
  render(todos: Todo[]) {
    const html = todos.map(t =>
      `<li class="${t.done ? 'done' : ''}">${t.text}</li>`
    ).join('');
    document.getElementById(this.containerId)!.innerHTML = html;
  }
}

// General-purpose: deeper, reusable for any list
class ListRenderer<T> {
  constructor(
    private containerId: string,
    private itemTemplate: (item: T) => string
  ) {}
  render(items: T[]) {
    const html = items.map(this.itemTemplate).join('');
    document.getElementById(this.containerId)!.innerHTML = html;
  }
}
```

The cost of the extra `itemTemplate` parameter is negligible; the benefit is that the module now solves a broader class of problems, eliminating future special-case renderers that would otherwise accumulate.

### Layered Encapsulation

We can push this idea further by layering implementations behind interfaces. The consumer depends only on the contract — `Storage`, `Renderer`, `Notifier` — while each implementation holds its own private logic. One `Storage` might use `localStorage`; another might use an API. One `Renderer` might use the DOM; another might use React. Each layer hides its own details, and the caller never needs to know which layer is active:

```typescript
interface Storage { save(todos: Todo[]): void; load(): Todo[]; }
interface Renderer { render(todos: Todo[]): void; }

class LocalStorage implements Storage { /* ... */ }
class ApiStorage implements Storage { /* ... */ }

class DomRenderer implements Renderer { /* ... */ }
class ReactRenderer implements Renderer { /* ... */ }
```

This is encapsulation at work, and in OOP terms it is often achieved through interface inheritance or composition: the public contract stays thin and stable, while the private implementations evolve independently. The rule of thumb is that every level of abstraction should hide one layer of detail, and no layer should leak its internals to the layer above.

### Summary

In this framing, deep modules are not merely an architectural preference. They are a low-level, methodology-agnostic mechanism for complexity reduction. You do not need microservices, domain-driven design, or agile rituals to benefit from them. You simply hide the messy orchestration behind the thinnest possible interface, and let the caller forget that the mess exists.

---

## Define Errors Out Of Existence

### The Reflex to Throw

One of the most seductive traps in software design is the reflex to throw an exception at the first sign of irregularity. It feels correct, almost rigorous, to announce that something has gone wrong and force the caller to deal with it. But Ousterhout argues that this reflex often signals a failure of interface design rather than a genuine problem. The better response, in many cases, is to redefine the irregularity so that it is no longer an error at all.

Consider the seemingly innocent operation of unfollowing a user on a social platform. The naive design throws an exception if the caller attempts to unfollow someone they were never following:

```java
public class FollowService {
    private Set<String> following = new HashSet<>();

    public void unfollow(String targetUserId) throws NotFollowingException {
        if (!following.contains(targetUserId)) {
            throw new NotFollowingException(
                "User " + targetUserId + " is not being followed"
            );
        }
        following.remove(targetUserId);
    }
}
```

### Defining Errors Away: The Unfollow Example

At first glance, this version appears more robust. It validates preconditions. It communicates intent clearly. It even feels symmetric: if `follow()` adds a relationship, should not `unfollow()` verify that the relationship exists before removing it?

I would argue that this symmetry is misleading. The semantic question is not "was this user previously followed?" but rather "what is the post-condition after this operation?" If the desired post-condition is "this user is not in my following set," then the operation has already succeeded before it begins. The exception punishes the caller for requesting a state that is already true.

A better design recognizes that absence is not an error:

```java
public class FollowService {
    private Set<String> following = new HashSet<>();

    public void unfollow(String targetUserId) {
        // Set.remove() returns false if the element was not present,
        // which is exactly the desired state: this user is not followed.
        following.remove(targetUserId);
    }
}
```

The difference is not merely stylistic. In the first version, every caller must wrap the operation in a try-catch block or propagate the exception upward, bloating the codebase with defensive code for a condition that requires no handling. In the second version, the caller simply calls `unfollow()` and moves on. The edge case has been absorbed into the normal path.

This principle scales beyond social media. Java's `Map.remove(key)` does not throw if the key is absent; it returns `null` or the previous value. Go's `delete(map, key)` is always safe. These designs recognize that the absence of a key is not an error. It is simply the state of the world after the operation completes. The error has been defined out of existence.

None of this is to say that exceptions are never appropriate. If a bank transfer fails because the account is frozen, the caller genuinely needs to know. But if the operation's goal is to ensure a particular state, and that state is already achieved, then throwing is a form of false precision. It converts a no-op into a crisis, and forces every caller to write boilerplate catch blocks for a condition that requires no handling.

In a sense, this is the error-handling analogue of deep modules. A deep module hides implementation complexity behind a simple interface; a well-designed error model hides edge cases by making them indistinguishable from the happy path. The caller does not need to know whether the unfollow was "real" or a no-op. They only need to know that, after the call, the user is not followed. And that is already guaranteed.

### Exception Aggregation: One Catch Block

This brings us to **exception aggregation**, the third technique Ousterhout proposes for reducing exception-handling complexity. The idea is simple but often resisted: handle many exceptions with a single piece of code, rather than writing distinct handlers for every individual condition.

Consider what happens when we refuse to aggregate. A `FollowService` that throws a different exception for every rule violation forces its callers into an exhausting game of whack-a-mole:

```java
public class FollowService {
    public void follow(String targetUserId) throws FollowLimitExceededException {
        if (following.size() >= MAX_FOLLOWING) {
            throw new FollowLimitExceededException("Limit reached");
        }
        following.add(targetUserId);
    }

    public void unfollow(String targetUserId) throws NotFollowingException {
        if (!following.contains(targetUserId)) {
            throw new NotFollowingException("Not following this user");
        }
        following.remove(targetUserId);
    }

    public void block(String targetUserId) throws AlreadyBlockedException {
        if (blocked.contains(targetUserId)) {
            throw new AlreadyBlockedException("Already blocked");
        }
        blocked.add(targetUserId);
    }
}
```

The caller, say, a REST controller, must now juggle three catch blocks for operations that are conceptually identical from the HTTP layer's perspective: they all represent a business rule violation that should return 400 Bad Request.

```java
// Controller code: shallow, noisy, repetitive
try {
    service.follow(targetId);
} catch (FollowLimitExceededException e) {
    return Response.badRequest(e.getMessage());
} catch (NotFollowingException e) {
    return Response.badRequest(e.getMessage());
} catch (AlreadyBlockedException e) {
    return Response.badRequest(e.getMessage());
}
```

An aggregated design lifts all three conditions into one general exception. The service layer defines what went wrong; the controller layer decides how to respond. The interface becomes deeper because the caller now only needs to know about one exception type:

```java
public class FollowService {
    public void follow(String targetUserId) {
        if (following.size() >= MAX_FOLLOWING) {
            throw new OperationalException("FOLLOW_LIMIT_EXCEEDED", "Limit reached");
        }
        following.add(targetUserId);
    }

    public void unfollow(String targetUserId) {
        // Absence is not an error — defined out of existence
        following.remove(targetUserId);
    }

    public void block(String targetUserId) {
        if (blocked.contains(targetUserId)) {
            throw new OperationalException("ALREADY_BLOCKED", "Already blocked");
        }
        blocked.add(targetUserId);
    }
}
```

```java
// Controller code: one handler, one response path
try {
    service.follow(targetId);
} catch (OperationalException e) {
    return Response.badRequest(e.getMessage());
}
```

One general-purpose mechanism replaces many special-purpose ones. The cognitive load on the controller drops from three branches to one, and the service retains the freedom to add new business rules without forcing every caller to update its catch blocks.

### Exception Types as Shallow Interfaces

But there is a deeper problem with `NotFollowingException` that we have not yet addressed. It is not merely that the exception is unnecessary; it is that the exception *type itself* is a form of shallow module. It is hyper-specific to one domain operation, unfollowing, and forces every caller to know about a micro-condition that has no relevance to their broader task. One could argue that specificity is good because it communicates intent precisely. But Ousterhout would counter that exceptions are part of a module's interface, and interfaces with many exception types are shallower than interfaces with few. `NotFollowingException`, `FollowLimitExceededException`, `FollowTargetBlockedException`, each adds a new branch to the caller's mental model. The cognitive cost compounds. A more general `OperationalException` or `DomainRuleException`, thrown only when the caller genuinely cannot proceed, would keep the interface narrower without losing essential information.

### Orchestrate Recovery: Abort, Cleanup, Continue

Exception aggregation becomes even more powerful when the aggregated exception is designed not just to report failure, but to *orchestrate recovery*. Ousterhout describes a pattern particularly useful in systems that process a series of requests: define a single exception type that can be thrown from any point during request processing, caught at the top of the loop, and used to abort, clean up, and continue.

A concrete example is a LangChain pipeline that ingests a batch of documents. Any step can fail — validation, embedding, LLM call — and each failure demands a different response from the loop. Rather than making the loop guess, we define a single aggregated exception — `BatchException` — that carries its own action field. The exception type stays narrow; the action encoded in the data routes the loop.

```python
from enum import Enum
from langchain_core.documents import Document
from openai import RateLimitError, BadRequestError

class BatchAction(Enum):
    SKIP  = "skip"   # bad document — move on
    RETRY = "retry"  # transient failure — try again
    HALT  = "halt"   # fatal — stop the batch

class BatchException(Exception):
    """Single orchestration signal for the ingestion loop."""
    def __init__(self, action: BatchAction, reason: str = ""):
        self.action = action
        super().__init__(reason)

def process(doc):
    # Pre-flight: if the system is fundamentally broken, stop before doing any work
    if not llm.is_healthy():
        raise BatchException(BatchAction.HALT, "LLM service down")

    # Step 1: Validate
    if not doc.page_content or len(doc.page_content) < 50:
        raise BatchException(BatchAction.SKIP, "too short")

    # Step 2: Split and embed
    chunks = split(doc)
    doc_id = vectorstore.add_documents(chunks)

    # Step 3: LLM summary
    try:
        summary = llm.invoke(f"Summarize: {doc.page_content[:2000]}")
    except RateLimitError:
        vectorstore.delete([doc_id])
        raise BatchException(BatchAction.RETRY)        # transient → retry this doc
    except BadRequestError:
        vectorstore.delete([doc_id])
        raise BatchException(BatchAction.SKIP, "filtered")  # bad input → skip

    # Step 4: Save metadata
    try:
        save_metadata(doc_id, summary)
    except ConnectionError:
        vectorstore.delete([doc_id])
        raise BatchException(BatchAction.SKIP, "DB unreachable")

for doc in documents:
    try:
        process(doc)
    except BatchException as e:                        # one catch block — one exception type
        if e.action == BatchAction.SKIP:
            print(f"Skip: {e}")
            continue
        elif e.action == BatchAction.RETRY:
            time.sleep(2)
            process(doc)
        elif e.action == BatchAction.HALT:
            print(f"Halt: {e}")
            break
```

The logic is now clean, and the interface is genuinely narrow. A `HALT` signal fires before any expensive work, when the entire pipeline is impossible. `RETRY` and `SKIP` fire after partial state has been created, but they always clean it up before delegating to the loop. The exception itself carries the instruction; the loop only executes it. And critically, the caller — the loop — catches exactly one type, not three.

This is the difference between **handling** and **orchestration**. Handling is one fixed workflow: catch → log → clean up → continue. Orchestration is a router: the exception tells the loop which workflow to run, and the loop obeys.

### Summary

I would argue that this is exception handling at its most elegant. The alternative, scattering abort logic, cleanup code, and continuation logic across every service method, is temporal decomposition in disguise. By using exception types as orchestration signals, we hide the messy lifecycle management behind a deep interface: throw the signal, and let the loop do the right thing.

---

## Comments

One of the more underappreciated ideas in Ousterhout's book is that comments are not afterthoughts. They are part of the interface. The purpose of a comment is to explain the abstraction: what the module promises, what it does not promise, and why the caller should care. Without this, the only way to understand the contract is to read the implementation. And if the implementation is the documentation, the interface has failed.

### Comments vs Long Names

When comments are missing, developers compensate by inflating names. The name tries to carry the entire contract, which quickly becomes absurd:

```typescript
// No comments. The name is forced to carry everything.
function calculateTotalPriceAfterDiscountAndTaxForPremiumUser(
  basePrice: number,
  userTier: "premium" | "standard",
  discountCode: string | null,
  region: string
): number {
  // 30 lines of logic the caller must read to understand:
  // - Does this include shipping?
  // - What happens when discountCode is null?
  // - Is tax applied before or after discount?
  // - Is the result rounded? In what currency?
}
```

Even with this mouthful of a name, the caller still cannot answer basic questions without reading the body. The name is both too long and too vague. Ousterhout's point is that names should be concise; the contract belongs in the comment:

```typescript
/**
 * Computes the final checkout price for an order.
 *
 * The calculation includes:
 * - Base item price
 * - Tier-based discount (premium users get 20% off)
 * - Optional promotional code (applied after tier discount)
 * - Regional sales tax (applied last)
 *
 * Shipping is NOT included; add it separately via `addShipping()`.
 *
 * @returns final price in cents, rounded down
 */
function checkoutPrice(
  basePrice: number,
  userTier: "premium" | "standard",
  discountCode: string | null,
  region: string
): number {
  // implementation...
}
```

The name is short. The comment is precise. The caller knows exactly what is promised, what is excluded, and in what order operations occur — without reading a single line of implementation.

> There is also a practical payoff. When comments follow a standard convention like JSDoc or Javadoc, the IDE surfaces them automatically. A developer who types `checkoutPrice` sees the full contract — what is included, what is excluded, the return format — in a tooltip without jumping to the declaration. The abstraction is visible at the point of use, which is exactly where it is needed. Without this convention, the comment is buried in the source file and the developer is forced to navigate away from their current context, breaking flow and defeating the purpose of the abstraction.

### Comments on Classes: Design Intent, Not Mechanics

The same principle applies at the class level. Without a class-level comment, the name must encode every architectural decision:

```typescript
// The name tries to describe the entire design.
class InMemoryCachingUserPreferenceRepositoryWithEventBusNotification {
  // The caller must read the implementation to know:
  // - Is this cache shared across instances?
  // - What events are published, and when?
  // - Is the data durable across restarts?
}
```

A concise name plus a class-level comment is far more powerful:

```typescript
/**
 * In-memory cache for user preferences with LRU eviction.
 *
 * On update, publishes a `PreferenceChanged` event to the event bus
 * so that other services can invalidate their caches.
 *
 * This is NOT durable: preferences are lost on restart.
 * Use `PersistentPreferenceStore` for durability.
 */
class PreferenceCache {
  // ...
}
```

The comment answers questions the name cannot: durability guarantees, event semantics, and the relationship to other modules. The caller understands the abstraction in ten seconds instead of ten minutes.

But this observation, that comments augment the interface, only describes one side of the practice. Ousterhout argues that comments operate at two distinct elevations. There is the comment that describes the abstraction from the outside, and there is the comment that explains the implementation from the inside. The first helps callers use the module correctly; the second helps maintainers modify it safely. Treating them as a single undifferentiated activity is why so many developers default to either over-commenting every line or abandoning comments entirely.

#### High-level and low-level comments

> High-level comments describe the abstraction. Low-level comments describe non-obvious implementation details. Most short methods need only the former.

Ousterhout draws a distinction between two layers of commenting. **High-level comments** sit at the interface — the class header, the method signature, the module export. They describe *what* the abstraction promises and *why* it exists. **Low-level comments** sit inside the implementation. They describe details that are not obvious from the code: why this specific batch size was chosen, why this operation must happen before that one, why this edge case is handled with a workaround rather than a proper fix.

Most short methods need no low-level comments. If the implementation is straightforward, the code speaks for itself. But when the implementation involves subtle trade-offs — performance, concurrency safety, recovery ordering — a low-level comment prevents the next reader from rediscovering the rationale through painful debugging.

```typescript
/**
 * High-level comment: describes the abstraction
 *
 * Archives completed todos to cold storage and removes them
 * from the active index. This preserves query performance
 * by keeping the active set small.
 *
 * @param before - archive todos completed before this date
 * @returns number of todos archived
 */
function archiveCompletedTodos(before: Date): number {
  // Low-level comment: explains non-obvious implementation detail
  // We delete in batches of 500 to avoid holding a long-running
  // transaction lock on the active index, which would block
  // concurrent writes.
  const BATCH_SIZE = 500;

  let archived = 0;
  let batch;
  do {
    batch = queryActiveIndex({ completedBefore: before, limit: BATCH_SIZE });
    if (batch.length === 0) break;

    // Low-level comment: explains why order matters
    // Must write to cold storage BEFORE deleting from active index.
    // If deletion happens first and the write fails, the data is lost.
    coldStorage.write(batch);
    activeIndex.delete(batch.map(t => t.id));

    archived += batch.length;
  } while (batch.length === BATCH_SIZE);

  return archived;
}
```

The high-level JSDoc answers questions a caller would ask: what does this function do, why does it exist, what does it return? The low-level comments answer questions a maintainer would ask inside the body: why 500, and why this specific write-then-delete order? The two layers do not compete; they serve different readers at different depths.

### Observations on Commenting Practice

Ousterhout's framework for comments is clear, but applying it in practice surfaces three patterns that I have found worth watching closely.

#### The obviousness test

> Comments should describe things that are not obvious from the code.

This sounds simple until you try to apply it. What counts as "obvious" varies by reader. A junior developer may need context that a senior takes for granted. An AI coding agent may generate comments that narrate the implementation line by line (`// increment the counter` above `counter++`), adding visual noise without value.

I would argue that a useful heuristic is stability: if you can infer the comment by reading the next line of code, it is noise. If it explains the *why* and the *contract*, the assumptions and exclusions, then it is likely essential. Good comments widen the gap between the simple interface and the complex implementation. Bad comments dilute the ones that actually matter.

#### Comments as design sketches

> The draft is not sacred; the final comment is.

Writing the comment *before* the code is a design tool, not a documentation chore. It forces you to define the abstraction before the implementation drags you into details. The first pass is a sketch of logical steps, no code, just intent.

```typescript
class TodoService {
  /**
   * Archives completed todos to cold storage and removes them
   * from the active index. Preserves query performance by
   * keeping the active set small. Operation is atomic.
   */
  archiveCompleted(before: Date): number;
}
```

The second pass happens after the code is done. The gap between the sketch and the implementation is a measure of design fidelity. If the code contradicts the comment, the design has leaked.

Here the implementation violates every clause of its own contract. It is not atomic. A failure mid-loop leaves partial state. It does not preserve performance; it loads the entire result set into memory without batching. And it leaks internal structure by exposing `activeIndex` and `coldStorage` directly:

```typescript
class TodoService {
  /**
   * Archives completed todos to cold storage and removes them
   * from the active index. Preserves query performance by
   * keeping the active set small. Operation is atomic.
   */
  archiveCompleted(before: Date): number {
    const todos = this.activeIndex.findAll()
      .filter(t => t.completed && t.completedAt < before);
    for (const todo of todos) {
      this.coldStorage.insert(todo);      // partial state if this fails
      this.activeIndex.remove(todo.id);   // not atomic
    }
    return todos.length;
  }
}
```

A good design produces code that matches its description. The same comment now describes an implementation that is actually atomic, batched, and self-contained:

```typescript
class TodoService {
  /**
   * Archives completed todos to cold storage and removes them
   * from the active index. Preserves query performance by
   * keeping the active set small. Operation is atomic.
   */
  archiveCompleted(before: Date): number {
    return this.storage.archive({ completedBefore: before });
  }
}
```

The discrepancy between the comment you imagined and the code you wrote is the earliest signal that the design needs revision. When the sketch and the implementation align, you know the abstraction held.

#### What and why, not how

> The comment should describe what the code does and why it does it. The code already shows how.

There is a useful distinction between three kinds of information: *what*, *why*, and *how*. The **what** is the abstraction, the purpose of the function, the contract with the caller. The **why** is the rationale, why this algorithm was chosen, why this threshold was set. The **how** is the implementation, the loops, the conditionals, the mechanics.

The code is the authoritative description of *how*. A comment that explains *how* is redundant at best and misleading at worst, because it will drift out of sync the moment someone refactors. A comment that explains *what* and *why* is stable, because the abstraction and rationale change far less often than the mechanics.

```typescript
// BAD: describes HOW the code works, not WHAT or WHY
// Iterate through todos array, check if done is false,
// push to active list, return active list
function getActiveTodos(todos: Todo[]): Todo[] {
  const active = [];
  for (const todo of todos) {
    if (!todo.done) active.push(todo);
  }
  return active;
}

// GOOD: describes WHAT and WHY
// Returns todos that still require user attention.
// A todo is considered "active" until explicitly marked done,
// even if its due date has passed. Overdue items remain visible.
function getActiveTodos(todos: Todo[]): Todo[] {
  return todos.filter(t => !t.done);
}
```

The bad comment narrates the implementation line by line. It adds no value; the reader can already see the loop and the condition. The good comment answers questions the code cannot: what is the semantic meaning of "active" in this context, and why do overdue items remain visible? Those answers survive refactoring. The loop can become a `filter`, the condition can become a helper method, and the comment remains true.

---

## Strategic vs Tactical Programming

One of the more striking patterns I have noticed when working with AI coding agents is that their default mode of operation looks remarkably like what Ousterhout calls **tactical programming** — but accelerated by roughly two orders of magnitude.

The tactical programmer asks a single question: *does it work?* If the tests pass, the task is complete. I would argue that this is not laziness; under deadline pressure, it is often a locally rational response. The problem is that the rationality is myopic. Each individual commit is optimal, but the global trajectory is toward a codebase that functions yet resists change. Ousterhout calls the most extreme practitioners "tactical tornados": prodigious producers who leave behind a trail of working but unmaintainable code.

**Strategic programming** asks a different question: *is this the best design?* It treats every commit as an opportunity to reduce complexity, not merely to ship a feature. The investment is front-loaded — a strategic module takes longer to write initially — but subsequent changes become cheaper. A small reduction in complexity today prevents a large increase tomorrow. This is not perfectionism; it is compounding.

### Why is strategic programming harder now?

The arrival of AI coding agents has altered the economics of the tradeoff. Consider the incentives:

1. **Speed vs. sustainability.** An LLM can produce a working implementation from a three-sentence prompt. The agent generates exactly the kind of code Ousterhout warns against: shallow, locally optimal, globally incoherent. The human in the loop, facing a working prototype, must actively choose to slow down and redesign. The default path is now the fast path.

2. **The illusion of progress.** A prototype that compiles feels like a deliverable. But a prototype without design is debt that compounds faster than any agent can refactor it. The danger is not that AI writes bad code; it is that AI makes bad code so easy to produce that we stop noticing.

3. **The experience paradox.** If a developer spends 90% of their time reviewing agent output and 10% writing original code, the 10% becomes the only space where design taste is actually exercised. I would argue that the time spent guiding an agent to restructure a shallow module into a deep one, or rejecting a locally clever hack in favor of a globally consistent pattern, is the only software design practice that will remain scarce in an agent-saturated world.

### Refactoring as investment, not cost

> The time you spend refactoring is not overhead. It is the only coding experience you will have.

Strategic programming requires viewing redesign and refactoring as an investment with returns in two currencies. The first is the codebase itself: cleaner abstractions, lower cognitive load, fewer unknown unknowns. The second is yourself. Every refactor is a rep you perform on your design taste. The tenth iteration of a function teaches more than the first ten features shipped without reflection.

The discipline is iterative. Generate the first draft, then interrogate it. Is this a good abstraction? Can someone unfamiliar with the feature understand this in ten seconds? Does this module hide complexity, or does it leak? Does this function duplicate logic that already exists? Run this loop a hundred times. The gap between what the agent produced and what the design requires is where you learn.

### Consistency as contract

A strategic codebase maintains consistency the way a language maintains grammar. If pagination is handled through a `PaginatedQuery` abstraction in one module, a new feature should not introduce a bespoke `offset` and `limit` parameter pair. If dates are formatted through `DateUtils.format()`, a coding agent should not generate a one-off `formatTodoDate` without explicit justification.

```typescript
// Already exists in the codebase — the established pattern
class DateUtils {
  static format(date: Date, pattern: string): string { /* ... */ }
}

// BAD: agent-generated one-off function, same purpose, different signature
// No explanation for why the existing utility was bypassed
function formatTodoDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

// GOOD: reuses the established abstraction
const displayDate = DateUtils.format(todo.completedAt, 'YYYY-MM-DD');
```

Agents, left without explicit constraints, are entropy engines. They create ad-hoc implementations because those are locally easier to generate than searching the existing codebase for the right abstraction. It is the human's taste — the accumulated sense of what belongs where — that prevents this drift. Consistency is not aesthetic preference; it is a contract that reduces the reader's cognitive load. Every exception to an established pattern must carry a justification that survives the commit message.

### What remains scarce?

AI will not make good programmers. It will make an infinite supply of tactical programmers, each generating plausible code at machine speed. What remains scarce — and therefore valuable — is the human ability to look at working code and say: *this is not good enough*. That judgment is taste, and it is cultivated only through deliberate practice. Cherish every project as a canvas for that practice. The code you refactor today is the taste you will apply tomorrow.

It is currently an open question whether the next generation of developers, raised on agent-assisted workflows, will develop that taste at all — or whether the incentive to ship will permanently overwhelm the incentive to design.

---

## References

**Primary source:**
- Ousterhout, J. *A Philosophy of Software Design*, 2nd ed. Stanford University, 2021. [Official site](https://web.stanford.edu/~ouster/cgi-bin/book.php)
- Chinese translation: [go7hic.github.io](https://go7hic.github.io/A-Philosophy-of-Software-Design/)

**Chapters covered in this note:**
- Ch 1–2: Complexity (symptoms, root causes)
- Ch 4, 7: Deep Modules, Information Hiding
- Ch 10: Define Errors Out of Existence
- Ch 13, 15: Comments (as documentation and as design tool)
- Ch 20: Tactical vs Strategic Programming

**Talks that inspired this reading:**
- Pocock, M. ["Software Fundamentals Matter More Than Ever"](https://www.youtube.com/watch?v=v4F1gFy-hqg), 2024.

**Related reading:**
- Brooks, F. "No Silver Bullet" — essential vs. accidental complexity.
- McConnell, S. *Code Complete* (complexity as primary imperative): [summary](https://dev.to/software_writer/managing-complexity-37e8)
- Book summary / Ch19 notes: [carstenbehrens.com](https://carstenbehrens.com/a-philosophy-of-software-design-summary/)
