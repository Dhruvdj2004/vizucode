import { build, type Raw } from './build';

/** Round-robin completion times for bursts arriving together at t = 0. */
function roundRobin(bursts: number[], q: number): number[] {
  const rem = [...bursts];
  const done = bursts.map(() => 0);
  const queue = bursts.map((_, i) => i);
  let t = 0;
  while (queue.length) {
    const i = queue.shift()!;
    const run = Math.min(q, rem[i]);
    t += run;
    rem[i] -= run;
    if (rem[i] > 0) queue.push(i);
    else done[i] = t;
  }
  return done;
}

function pageFaults(refs: number[], frames: number, policy: 'fifo' | 'lru'): number {
  const mem: number[] = [];
  let faults = 0;
  for (const p of refs) {
    const idx = mem.indexOf(p);
    if (idx >= 0) {
      if (policy === 'lru') mem.push(...mem.splice(idx, 1));
      continue;
    }
    faults++;
    if (mem.length === frames) mem.shift();
    mem.push(p);
  }
  return faults;
}

export const rawCoreCs: Raw[] = [
  // ───────── DBMS ─────────
  {
    id: 'cs_001', t: 'DBMS', s: 'Keys', d: 'E',
    q: 'Which key uniquely identifies each row of a table and can never be NULL?',
    o: ['Foreign key', 'Primary key', 'Candidate key that allows NULL', 'Composite attribute'], a: 1,
    e: 'A primary key uniquely identifies each row and is implicitly NOT NULL. A foreign key references another table and may be NULL.',
  },
  {
    id: 'cs_002', t: 'DBMS', s: 'Group By & Having', d: 'E',
    q: 'Which SQL clause filters groups after aggregation?',
    o: ['WHERE', 'HAVING', 'ORDER BY', 'DISTINCT'], a: 1,
    e: 'WHERE filters individual rows before grouping; HAVING filters groups after GROUP BY, so it can use aggregates like COUNT(*) > 5.',
  },
  {
    id: 'cs_003', t: 'DBMS', s: 'Joins', d: 'E',
    q: 'Table A has 5 rows and table B has 4 rows. How many rows does A CROSS JOIN B return?',
    o: ['9', '5', '20', '4'], a: 2,
    e: 'A cross join is the Cartesian product: every row of A paired with every row of B, 5 × 4 = 20 rows.',
    calc: 5 * 4,
  },
  {
    id: 'cs_004', t: 'DBMS', s: 'SQL Output', d: 'M',
    table: { caption: 'Table Emp', head: ['dept', 'salary'], rows: [['HR', 40], ['HR', 60], ['IT', 50], ['IT', 70], ['IT', 'NULL']] },
    code: 'SELECT dept, COUNT(salary)\nFROM Emp\nGROUP BY dept;',
    q: 'What does this query return?',
    o: ['HR 2, IT 3', 'HR 2, IT 2', 'HR 1, IT 2', 'An error, because of the NULL'], a: 1,
    e: 'COUNT(column) counts only non-NULL values, so IT counts 50 and 70 → 2, and HR has 2: the result is HR 2, IT 2. (COUNT(*) would give IT 3.)',
  },
  {
    id: 'cs_005', t: 'DBMS', s: 'Normalization', d: 'M',
    q: 'A relation is in 2NF if it is in 1NF and has no:',
    o: ['transitive dependency', 'partial dependency of a non-prime attribute on a candidate key', 'multivalued dependency', 'join dependency'], a: 1,
    e: '2NF removes partial dependencies — a non-prime attribute depending on only part of a composite candidate key. Removing transitive dependencies is 3NF; multivalued is 4NF; join dependency is 5NF.',
  },
  {
    id: 'cs_006', t: 'DBMS', s: 'Normalization', d: 'H',
    q: 'Relation R(A, B, C, D) has functional dependencies A → B, B → C and C → D. What is the highest normal form R satisfies?',
    o: ['1NF', '2NF', '3NF', 'BCNF'], a: 1,
    e: 'A is the only candidate key. It is a single attribute, so no partial dependency exists → 2NF holds. But B → C has a non-key determinant and C is non-prime, a transitive dependency (A → B → C), so R is not in 3NF. Highest: 2NF.',
  },
  {
    id: 'cs_007', t: 'DBMS', s: 'ACID', d: 'E',
    q: 'Which ACID property guarantees that once a transaction commits, its changes survive a system crash?',
    o: ['Atomicity', 'Consistency', 'Isolation', 'Durability'], a: 3,
    e: 'Durability: committed changes are persisted (e.g. via the write-ahead log) and survive crashes.',
  },
  {
    id: 'cs_008', t: 'DBMS', s: 'Transactions', d: 'M',
    q: 'Two concurrent transactions both read a balance of ₹1,000, each adds ₹100, and both write back ₹1,100. One update is lost. Which ACID property has been violated?',
    o: ['Atomicity', 'Consistency', 'Isolation', 'Durability'], a: 2,
    e: 'This is the lost-update anomaly: concurrent transactions interfered with each other. Isolation requires the result to match some serial order, which would give ₹1,200.',
  },
  {
    id: 'cs_009', t: 'DBMS', s: 'Indexing', d: 'M',
    q: 'Which statement about a clustered index is TRUE?',
    o: [
      'A table can have many clustered indexes',
      'A table can have at most one clustered index, because it determines the physical order of rows',
      'A clustered index never speeds up range queries',
      'A clustered index stores only pointers, never the data',
    ], a: 1,
    e: 'Rows can be physically ordered in only one way, so there is at most one clustered index. Because rows are stored in key order, it is especially good for range queries.',
  },
  {
    id: 'cs_010', t: 'DBMS', s: 'Subqueries', d: 'H',
    q: 'Which query correctly returns the second highest salary from Employee(salary)?',
    o: [
      'SELECT MAX(salary) FROM Employee WHERE salary < (SELECT MAX(salary) FROM Employee);',
      'SELECT MAX(salary) FROM Employee WHERE salary > (SELECT MAX(salary) FROM Employee);',
      'SELECT salary FROM Employee ORDER BY salary LIMIT 1 OFFSET 1;',
      'SELECT MIN(salary) FROM Employee GROUP BY salary;',
    ], a: 0,
    e: 'The subquery finds the highest salary; the outer MAX over salaries strictly below it is the second highest (and handles duplicates of the top value). The ORDER BY version sorts ascending, giving the second lowest; the ">" version returns NULL.',
  },
  {
    id: 'cs_011', t: 'DBMS', s: 'Joins', d: 'H',
    table: { caption: 'A(id) = {1, 2, 3}   ·   B(id) = {2, 3, 3, 4}', head: ['Table', 'id values'], rows: [['A', '1, 2, 3'], ['B', '2, 3, 3, 4']] },
    code: 'SELECT COUNT(*)\nFROM A INNER JOIN B ON A.id = B.id;',
    q: 'What does this query return?',
    o: ['2', '3', '4', '5'], a: 1,
    e: 'Each matching pair produces a row. id 2 matches once, id 3 matches the two 3s in B → 1 + 2 = 3 rows. Duplicates in B multiply the matches.',
    check: () => [1, 2, 3].reduce((n, a) => n + [2, 3, 3, 4].filter((b) => b === a).length, 0) === 3,
  },
  {
    id: 'cs_012', t: 'DBMS', s: 'Constraints', d: 'E',
    q: 'Which constraint ensures that a column\'s values match existing values in another table?',
    o: ['UNIQUE', 'CHECK', 'FOREIGN KEY', 'DEFAULT'], a: 2,
    e: 'A FOREIGN KEY enforces referential integrity: each value must exist in the referenced table\'s key (or be NULL).',
  },

  // ───────── Operating Systems ─────────
  {
    id: 'cs_013', t: 'Operating Systems', s: 'Process vs Thread', d: 'E',
    q: 'Which of these is shared among threads of the same process?',
    o: ['Stack', 'Program counter', 'Register set', 'Heap memory'], a: 3,
    e: 'Threads share the process\'s code, global data, heap memory and open files. Each thread has its own stack, program counter and registers.',
  },
  {
    id: 'cs_014', t: 'Operating Systems', s: 'FCFS', d: 'M',
    q: 'Processes P1 (burst 24), P2 (burst 3) and P3 (burst 3) arrive at time 0 in that order. What is the average waiting time under FCFS scheduling?',
    o: ['3', '10', '17', '27'], a: 2,
    e: 'Waiting times: P1 = 0, P2 = 24, P3 = 27. Average = 51/3 = 17. (A long job first causes the convoy effect.)',
    calc: (0 + 24 + 27) / 3,
  },
  {
    id: 'cs_015', t: 'Operating Systems', s: 'SJF', d: 'M',
    q: 'Processes P1 (burst 24), P2 (burst 3) and P3 (burst 3) all arrive at time 0. What is the average waiting time under non-preemptive SJF?',
    o: ['3', '6', '9', '17'], a: 0,
    e: 'SJF runs P2, P3, then P1. Waiting times: P2 = 0, P3 = 3, P1 = 6. Average = 9/3 = 3.',
    calc: (0 + 3 + 6) / 3,
  },
  {
    id: 'cs_016', t: 'Operating Systems', s: 'Round Robin', d: 'H',
    q: 'P1 (burst 5), P2 (burst 3) and P3 (burst 1) arrive at time 0 in that order. With Round Robin and a time quantum of 2, when does P1 complete?',
    o: ['7', '8', '9', '10'], a: 2,
    e: 'Timeline: P1 0–2 (3 left), P2 2–4 (1 left), P3 4–5 (done), P1 5–7 (1 left), P2 7–8 (done), P1 8–9 (done). P1 completes at 9.',
    calc: roundRobin([5, 3, 1], 2)[0],
  },
  {
    id: 'cs_017', t: 'Operating Systems', s: 'Deadlock', d: 'E',
    q: 'Which of these is NOT one of the four necessary conditions for deadlock?',
    o: ['Mutual exclusion', 'Hold and wait', 'Preemption', 'Circular wait'], a: 2,
    e: 'The four conditions are mutual exclusion, hold and wait, NO preemption, and circular wait. Allowing preemption actually prevents deadlock.',
  },
  {
    id: 'cs_018', t: 'Operating Systems', s: 'Banker\'s Algorithm', d: 'H',
    table: { caption: 'One resource type, 12 instances in total', head: ['Process', 'Max need', 'Allocated'], rows: [['P0', 10, 5], ['P1', 4, 2], ['P2', 9, 2]] },
    q: 'Using the Banker\'s algorithm, which is a safe sequence?',
    o: ['⟨P1, P0, P2⟩', '⟨P0, P1, P2⟩', '⟨P2, P1, P0⟩', 'The system is in an unsafe state'], a: 0,
    e: 'Available = 12 − 9 = 3. Remaining needs: P0 = 5, P1 = 2, P2 = 7. Only P1 fits (2 ≤ 3); it finishes and releases 2 → 5. Now P0 fits (5 ≤ 5) → 10. Then P2 (7 ≤ 10). Safe sequence: ⟨P1, P0, P2⟩.',
    check: () => {
      const safe = (order: number[]) => {
        const max = [10, 4, 9], alloc = [5, 2, 2];
        let avail = 3;
        for (const p of order) {
          if (max[p] - alloc[p] > avail) return false;
          avail += alloc[p];
        }
        return true;
      };
      return safe([1, 0, 2]) && !safe([0, 1, 2]) && !safe([2, 1, 0]);
    },
  },
  {
    id: 'cs_019', t: 'Operating Systems', s: 'Paging', d: 'M',
    q: 'A system uses 32-bit logical addresses and 4 KB pages. How many entries does a single-level page table need?',
    o: ['2^12', '2^16', '2^20', '2^32'], a: 2,
    e: 'A 4 KB page needs a 12-bit offset. The remaining 32 − 12 = 20 bits are the page number, so there are 2^20 pages (about a million entries).',
  },
  {
    id: 'cs_020', t: 'Operating Systems', s: 'Page Replacement', d: 'H',
    q: 'For the reference string 7, 0, 1, 2, 0, 3, 0, 4 with 3 frames (initially empty), how many page faults occur under LRU?',
    o: ['5', '6', '7', '8'], a: 1,
    e: '7, 0, 1 fault (3). 2 faults, evicting 7 (4). 0 hits. 3 faults, evicting 1 — the least recently used (5). 0 hits. 4 faults, evicting 2 (6). Total 6. (FIFO would give 7 here.)',
    calc: pageFaults([7, 0, 1, 2, 0, 3, 0, 4], 3, 'lru'),
    check: () => pageFaults([7, 0, 1, 2, 0, 3, 0, 4], 3, 'fifo') === 7,
  },
  {
    id: 'cs_021', t: 'Operating Systems', s: 'Semaphore', d: 'M',
    q: 'A counting semaphore is initialised to 7. Then 20 wait (P) and 15 signal (V) operations are performed. What is its final value?',
    o: ['2', '-2', '12', '0'], a: 0,
    e: 'Each P decrements and each V increments: 7 − 20 + 15 = 2.',
    calc: 7 - 20 + 15,
  },
  {
    id: 'cs_022', t: 'Operating Systems', s: 'Page Replacement', d: 'M',
    q: 'Belady\'s anomaly — more frames causing more page faults — can occur with which algorithm?',
    o: ['LRU', 'Optimal', 'FIFO', 'All of these'], a: 2, fixed: true,
    e: 'FIFO can suffer Belady\'s anomaly. LRU and Optimal are stack algorithms, for which more frames never increase faults.',
  },
  {
    id: 'cs_023', t: 'Operating Systems', s: 'Context Switching', d: 'E',
    q: 'During a context switch, where does the OS save the state of the process being switched out?',
    o: ['In the page table', 'In its Process Control Block (PCB)', 'In the TLB', 'On the disk swap area only'], a: 1,
    e: 'The registers, program counter and other state are saved in the process\'s PCB so it can resume exactly where it stopped.',
  },
  {
    id: 'cs_024', t: 'Operating Systems', s: 'Mutex', d: 'M',
    q: 'Which statement about a mutex and a semaphore is TRUE?',
    o: [
      'A mutex can be released by any thread, but a semaphore only by its owner',
      'A mutex is usually released only by the thread that locked it, while a semaphore can be signalled by any thread',
      'A binary semaphore and a mutex are always identical',
      'A counting semaphore allows only one thread at a time',
    ], a: 1,
    e: 'A mutex has ownership — the locking thread must unlock it. A semaphore is a signalling counter with no owner, so any thread may signal it. A counting semaphore can admit several threads.',
  },
  {
    id: 'cs_025', t: 'Operating Systems', s: 'Virtual Memory', d: 'M',
    q: 'Thrashing occurs when:',
    o: [
      'The CPU is idle because no process is ready',
      'Processes spend more time paging than executing because they have too few frames',
      'Two processes wait for each other\'s resources',
      'A process is starved of CPU time by higher-priority processes',
    ], a: 1,
    e: 'Thrashing is heavy page-fault activity: processes lack enough frames for their working sets, so the system spends most of its time swapping pages. The other options describe idleness, deadlock and starvation.',
  },

  // ───────── Computer Networks ─────────
  {
    id: 'cs_026', t: 'Computer Networks', s: 'OSI Model', d: 'E',
    q: 'Which OSI layer is responsible for routing packets between different networks?',
    o: ['Data link layer', 'Network layer', 'Transport layer', 'Session layer'], a: 1,
    e: 'The network layer (layer 3, e.g. IP) handles logical addressing and routing between networks.',
  },
  {
    id: 'cs_027', t: 'Computer Networks', s: 'TCP vs UDP', d: 'E',
    q: 'Which of these transport protocols is connectionless?',
    o: ['TCP', 'UDP', 'Both TCP and UDP', 'Neither'], a: 1, fixed: true,
    e: 'UDP sends datagrams without a handshake or connection state. TCP sets up a connection with a three-way handshake.',
  },
  {
    id: 'cs_028', t: 'Computer Networks', s: 'Ports', d: 'E',
    q: 'What is the default port for HTTPS?',
    o: ['80', '8080', '443', '22'], a: 2,
    e: 'HTTPS uses port 443. HTTP uses 80, SSH uses 22, and 8080 is a common alternative HTTP port.',
  },
  {
    id: 'cs_029', t: 'Computer Networks', s: 'DNS', d: 'E',
    q: 'What is the primary job of DNS?',
    o: ['Assign IP addresses to hosts', 'Resolve domain names to IP addresses', 'Encrypt web traffic', 'Find MAC addresses on a LAN'], a: 1,
    e: 'DNS translates names like example.com into IP addresses. DHCP assigns addresses, TLS encrypts, and ARP finds MAC addresses.',
  },
  {
    id: 'cs_030', t: 'Computer Networks', s: 'ARP', d: 'M',
    q: 'ARP is used to find:',
    o: ['the IP address for a domain name', 'the MAC address for a known IP address on the local network', 'the default gateway for a subnet', 'the port number of a service'], a: 1,
    e: 'ARP broadcasts "who has IP x?" on the LAN and the owner replies with its MAC address, so frames can be delivered locally.',
  },
  {
    id: 'cs_031', t: 'Computer Networks', s: 'DHCP', d: 'M',
    q: 'Which of these is NOT normally provided to a client by a DHCP server?',
    o: ['IP address', 'Subnet mask', 'Default gateway', 'The client\'s own MAC address'], a: 3,
    e: 'The MAC address is burned into the client\'s network interface, and the client sends it to DHCP. DHCP hands out IP address, mask, gateway, DNS servers and lease time.',
  },
  {
    id: 'cs_032', t: 'Computer Networks', s: 'Subnetting', d: 'M',
    q: 'How many usable host addresses does a /26 subnet provide?',
    o: ['30', '62', '64', '126'], a: 1,
    e: 'A /26 leaves 32 − 26 = 6 host bits: 2^6 = 64 addresses. Subtract the network and broadcast addresses → 62 usable hosts.',
    calc: 2 ** 6 - 2,
  },
  {
    id: 'cs_033', t: 'Computer Networks', s: 'Subnetting', d: 'H',
    q: 'Which network does the host 192.168.10.77/27 belong to?',
    o: ['192.168.10.0', '192.168.10.64', '192.168.10.72', '192.168.10.96'], a: 1,
    e: 'A /27 has blocks of 32 addresses in the last octet: 0, 32, 64, 96, … 77 falls in 64–95, so the network address is 192.168.10.64 (broadcast .95).',
    check: () => (77 & 0b11100000) === 64,
  },
  {
    id: 'cs_034', t: 'Computer Networks', s: 'TCP/IP', d: 'E',
    q: 'What is the correct order of the TCP three-way handshake?',
    o: ['SYN → SYN-ACK → ACK', 'ACK → SYN → SYN-ACK', 'SYN → ACK → FIN', 'SYN-ACK → SYN → ACK'], a: 0,
    e: 'The client sends SYN, the server replies with SYN-ACK, and the client confirms with ACK: SYN → SYN-ACK → ACK.',
  },
  {
    id: 'cs_035', t: 'Computer Networks', s: 'NAT', d: 'M',
    q: 'Which statement about NAT is TRUE?',
    o: [
      'It encrypts packets between two routers',
      'It lets many devices with private IP addresses share one public IP address',
      'It converts domain names into IP addresses',
      'It assigns MAC addresses to devices',
    ], a: 1,
    e: 'NAT rewrites private source addresses (and ports) to a public address, letting a whole home or office network share one public IP.',
  },
  {
    id: 'cs_036', t: 'Computer Networks', s: 'TCP vs UDP', d: 'M',
    q: 'Which application would most likely prefer UDP over TCP?',
    o: ['File download', 'Email delivery', 'Live video call', 'Online banking'], a: 2,
    e: 'A live video call values low latency over perfect delivery — a late retransmitted packet is useless. File transfers, email and banking need TCP\'s reliable, ordered delivery.',
  },
  {
    id: 'cs_037', t: 'Computer Networks', s: 'Network Security', d: 'M',
    q: 'In HTTPS, what does the server\'s TLS certificate primarily let the client verify?',
    o: ['That the client\'s password is correct', 'That the server\'s public key really belongs to that domain', 'That the network has no malware', 'That the connection uses UDP'], a: 1,
    e: 'The certificate, signed by a trusted certificate authority, binds the domain name to the server\'s public key, so the client knows it is talking to the real server and not an impostor.',
  },
  {
    id: 'cs_038', t: 'Computer Networks', s: 'IP Addressing & Routing', d: 'H',
    q: 'A host with address 10.0.5.20/16 sends a packet to 10.0.9.4. What happens?',
    o: [
      'It must send the packet to the default gateway, since the third octets differ',
      'It delivers the packet directly on the local network, using ARP to find 10.0.9.4\'s MAC address',
      'It needs a DNS lookup first',
      'The packet is dropped because the subnets differ',
    ], a: 1,
    e: 'With a /16 mask only the first two octets identify the network: both hosts are in 10.0.0.0/16. Same network → direct delivery, with ARP resolving the MAC address. The differing third octet is a trap.',
    check: () => {
      const ip = (a: number, b: number, c: number, d: number) => ((a << 24) | (b << 16) | (c << 8) | d) >>> 0;
      const net = (x: number) => (x & 0xffff0000) >>> 0;
      return net(ip(10, 0, 5, 20)) === net(ip(10, 0, 9, 4));
    },
  },

  // ───────── OOP ─────────
  {
    id: 'cs_039', t: 'OOP', s: 'Encapsulation', d: 'E',
    q: 'Bundling data with the methods that operate on it, and restricting direct access to that data, is called:',
    o: ['Inheritance', 'Encapsulation', 'Polymorphism', 'Abstraction'], a: 1,
    e: 'Encapsulation keeps state private and exposes controlled methods (getters, setters, behaviour) to access it.',
  },
  {
    id: 'cs_040', t: 'OOP', s: 'Overloading', d: 'E',
    q: 'Which of these is an example of compile-time polymorphism?',
    o: ['Method overriding', 'Method overloading', 'Virtual functions', 'Dynamic dispatch'], a: 1,
    e: 'Method overloading is resolved at compile time: overloaded methods are chosen by the compiler from the argument types. Overriding, virtual functions and dynamic dispatch are run-time polymorphism.',
  },
  {
    id: 'cs_041', t: 'OOP', s: 'Virtual Functions', d: 'M',
    q: 'In C++, what makes a call through a base-class pointer invoke the derived class\'s version of a method at run time?',
    o: ['Declaring the method static', 'Declaring the method virtual in the base class', 'Declaring the method inline', 'Using a friend function'], a: 1,
    e: 'Marking the base method virtual enables dynamic dispatch through the vtable, so the object\'s actual type decides which version runs.',
  },
  {
    id: 'cs_042', t: 'OOP', s: 'Constructors', d: 'M',
    code: 'class A {\n    A(int x) { }\n}\n\n// elsewhere:\nA obj = new A();',
    q: 'What happens when this Java code is compiled?',
    o: ['It compiles; Java adds a default constructor', 'Compilation error: no no-argument constructor exists', 'It compiles, and x is set to 0', 'It throws a run-time exception'], a: 1,
    e: 'Java adds a default no-argument constructor only when a class declares no constructors at all. Since A(int) is declared, new A() has no matching constructor → compile-time error.',
  },
  {
    id: 'cs_043', t: 'OOP', s: 'Object Slicing', d: 'H',
    code: 'class Base {\npublic:\n    virtual void show() { cout << "Base"; }\n};\nclass Derived : public Base {\npublic:\n    void show() override { cout << "Derived"; }\n};\n\nint main() {\n    Base b = Derived();\n    b.show();\n}',
    q: 'What is the output of this C++ program?',
    o: ['Base', 'Derived', 'BaseDerived', 'Compilation error'], a: 0,
    e: 'Assigning a Derived object to a Base variable by value slices it: b is a genuine Base object. Virtual dispatch needs a pointer or reference, so b.show() prints "Base".',
  },
  {
    id: 'cs_044', t: 'OOP', s: 'Constructor Order', d: 'H',
    code: 'struct A {\n    A()  { cout << "A"; }\n    ~A() { cout << "a"; }\n};\nstruct B : A {\n    B()  { cout << "B"; }\n    ~B() { cout << "b"; }\n};\n\nint main() { B obj; }',
    q: 'What is the output of this C++ program?',
    o: ['ABab', 'ABba', 'BAba', 'BAab'], a: 1,
    e: 'Construction goes base first (A, then B); destruction runs in reverse (b, then a). Output: ABba.',
  },
  {
    id: 'cs_045', t: 'OOP', s: 'Interfaces', d: 'E',
    q: 'In Java, a class can:',
    o: ['extend multiple classes', 'implement multiple interfaces but extend only one class', 'implement only one interface', 'extend only abstract classes'], a: 1,
    e: 'Java allows single inheritance of classes but multiple inheritance of interfaces.',
  },
  {
    id: 'cs_046', t: 'OOP', s: 'Overriding', d: 'M',
    q: 'Which kind of method cannot be overridden in Java?',
    o: ['public instance methods', 'protected instance methods', 'static methods', 'abstract methods'], a: 2,
    e: 'Static methods belong to the class; a same-signature static method in a subclass hides the parent\'s method rather than overriding it (no dynamic dispatch). Abstract methods must be overridden.',
  },
  {
    id: 'cs_047', t: 'OOP', s: 'Abstraction', d: 'M',
    q: 'Which statement about abstract classes in Java is TRUE?',
    o: [
      'An abstract class cannot have constructors',
      'An abstract class can have constructors and non-abstract methods',
      'An abstract class can be instantiated with new',
      'All methods of an abstract class must be abstract',
    ], a: 1,
    e: 'Abstract classes can have constructors (called from subclass constructors), fields and concrete methods. They just cannot be instantiated directly.',
  },

  // ───────── DSA ─────────
  {
    id: 'cs_048', t: 'DSA', s: 'Searching', d: 'E',
    q: 'What is the time complexity of binary search on a sorted array of n elements?',
    o: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], a: 1,
    e: 'Each step halves the search range, so it takes about log₂ n steps: O(log n).',
  },
  {
    id: 'cs_049', t: 'DSA', s: 'Stack', d: 'E',
    q: 'Which data structure follows Last-In, First-Out (LIFO) order?',
    o: ['Queue', 'Stack', 'Heap', 'Linked list'], a: 1,
    e: 'A stack pushes and pops at the same end, so the most recently added element is removed first. A queue is FIFO.',
  },
  {
    id: 'cs_050', t: 'DSA', s: 'BST', d: 'E',
    q: 'An inorder traversal of a binary search tree visits the keys in:',
    o: ['random order', 'ascending sorted order', 'descending sorted order', 'level order'], a: 1,
    e: 'Inorder visits left subtree, node, right subtree. In a BST, left < node < right, so the keys come out in ascending sorted order.',
  },
  {
    id: 'cs_051', t: 'DSA', s: 'Trees', d: 'M',
    q: 'What is the maximum number of nodes in a binary tree of height h, where a tree with only the root has height 0?',
    o: ['2^h', '2^h − 1', '2^(h+1) − 1', '2h + 1'], a: 2,
    e: 'Level i can hold 2^i nodes, so a full tree has 1 + 2 + … + 2^h = 2^(h+1) − 1 nodes.',
  },
  {
    id: 'cs_052', t: 'DSA', s: 'Sorting', d: 'M',
    q: 'What is the worst-case time complexity of quicksort?',
    o: ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'], a: 1,
    e: 'If the pivot is always the smallest or largest element (e.g. a sorted array with a first-element pivot), partitions are maximally unbalanced: O(n²). The average case is O(n log n).',
  },
  {
    id: 'cs_053', t: 'DSA', s: 'Stack', d: 'M',
    q: 'What is the value of the postfix expression 5 3 2 * + 4 − ?',
    o: ['7', '12', '15', '3'], a: 0,
    e: 'Push 5, 3, 2. "*" → 3 × 2 = 6. "+" → 5 + 6 = 11. Push 4. "−" → 11 − 4 = 7.',
    calc: 5 + 3 * 2 - 4,
  },
  {
    id: 'cs_054', t: 'DSA', s: 'DFS', d: 'H',
    code: '1: [2, 3]\n2: [4]\n3: [4, 5]\n4: [6]\n5: [6]\n6: []',
    q: 'A directed graph is given as adjacency lists (above). What is the order in which a recursive DFS from vertex 1 visits the vertices, taking neighbours in the listed order?',
    o: ['1 2 4 6 3 5', '1 2 3 4 5 6', '1 3 5 6 4 2', '1 2 4 3 5 6'], a: 0,
    e: 'DFS goes deep first: 1 → 2 → 4 → 6 (dead end), back to 1 → 3 (4 already visited) → 5 (6 already visited). Order: 1 2 4 6 3 5. "1 2 3 4 5 6" is the BFS order.',
    check: () => {
      const g: Record<number, number[]> = { 1: [2, 3], 2: [4], 3: [4, 5], 4: [6], 5: [6], 6: [] };
      const seen: number[] = [];
      const dfs = (u: number) => {
        if (seen.includes(u)) return;
        seen.push(u);
        g[u].forEach(dfs);
      };
      dfs(1);
      return seen.join(' ') === '1 2 4 6 3 5';
    },
  },
  {
    id: 'cs_055', t: 'DSA', s: 'Time Complexity', d: 'H',
    code: 'for (int i = 1; i < n; i *= 2)\n    for (int j = 0; j < i; j++)\n        count++;',
    q: 'What is the time complexity of this code?',
    o: ['O(log n)', 'O(n)', 'O(n log n)', 'O(n²)'], a: 1,
    e: 'The inner loop runs i times, and i takes the values 1, 2, 4, … below n. The total is 1 + 2 + 4 + … < 2n, which is O(n) — not O(n log n) as the nesting suggests.',
    check: () => {
      const cnt = (n: number) => {
        let c = 0;
        for (let i = 1; i < n; i *= 2) c += i;
        return c;
      };
      return [1000, 100000].every((n) => cnt(n) < 2 * n);
    },
  },
  {
    id: 'cs_056', t: 'DSA', s: 'Heap', d: 'H',
    q: 'The keys 40, 30, 20, 15, 10 are inserted in that order into an initially empty binary min-heap stored as an array. What is the resulting array?',
    o: ['[10, 15, 20, 30, 40]', '[10, 15, 30, 40, 20]', '[10, 20, 15, 40, 30]', '[15, 10, 30, 40, 20]'], a: 1,
    e: 'Insert 40 → [40]. 30 sifts up → [30, 40]. 20 sifts up → [20, 40, 30]. 15 goes to index 3, swaps with 40 then 20 → [15, 20, 30, 40]. 10 goes to index 4, swaps with 20 then 15 → [10, 15, 30, 40, 20]. A heap is not a sorted array.',
    check: () => {
      const h: number[] = [];
      for (const k of [40, 30, 20, 15, 10]) {
        h.push(k);
        let i = h.length - 1;
        while (i > 0 && h[(i - 1) >> 1] > h[i]) {
          const p = (i - 1) >> 1;
          [h[p], h[i]] = [h[i], h[p]];
          i = p;
        }
      }
      return JSON.stringify(h) === '[10,15,30,40,20]';
    },
  },
  {
    id: 'cs_057', t: 'DSA', s: 'Hashing', d: 'M',
    q: 'A hash table of size 7 uses h(k) = k mod 7 with linear probing. The keys 10, 17 and 24 are inserted in that order. At which index is 24 stored?',
    o: ['3', '4', '5', '6'], a: 2,
    e: 'All three keys hash to 3. 10 takes index 3; 17 probes to 4; 24 probes 3 → 4 → 5 and is stored at index 5.',
    check: () => {
      const t: (number | null)[] = Array(7).fill(null);
      let last = -1;
      for (const k of [10, 17, 24]) {
        let i = k % 7;
        while (t[i] !== null) i = (i + 1) % 7;
        t[i] = k;
        last = i;
      }
      return last === 5;
    },
  },

  // ───────── Programming ─────────
  {
    id: 'cs_058', t: 'Programming', s: 'Python', d: 'E',
    code: 'print(3 * "ab")',
    q: 'What does this Python code print?',
    o: ['ab3', 'ababab', '3ab', 'TypeError'], a: 1,
    e: 'Multiplying a string by an integer repeats it: "ab" three times is "ababab".',
  },
  {
    id: 'cs_059', t: 'Programming', s: 'JavaScript', d: 'M',
    code: 'console.log(0.1 + 0.2 === 0.3);',
    q: 'What does this JavaScript code print?',
    o: ['true', 'false', 'undefined', 'NaN'], a: 1,
    e: '0.1 and 0.2 cannot be represented exactly in binary floating point; their sum is 0.30000000000000004, so the strict comparison is false.',
    check: () => 0.1 + 0.2 !== 0.3,
  },
  {
    id: 'cs_060', t: 'Programming', s: 'Java', d: 'M',
    code: 'String a = "hello";\nString b = new String("hello");\nSystem.out.println(a == b);\nSystem.out.println(a.equals(b));',
    q: 'What does this Java code print?',
    o: ['true then true', 'false then true', 'true then false', 'false then false'], a: 1,
    e: '== compares references: new String creates a separate object, so a == b is false. equals() compares contents, which match, so it is true. Output: false then true.',
  },
  {
    id: 'cs_061', t: 'Programming', s: 'C++', d: 'M',
    code: 'int a[] = {1, 2, 3, 4, 5};\nint *p = a + 1;\ncout << *(p + 2) << " " << p[-1];',
    q: 'What does this C++ code print?',
    o: ['3 1', '4 1', '4 2', '5 2'], a: 1,
    e: 'p points to a[1]. *(p + 2) is a[3] = 4, and p[-1] is a[0] = 1. Output: "4 1".',
  },
  {
    id: 'cs_062', t: 'Programming', s: 'Python', d: 'H',
    code: 'def add(x, items=[]):\n    items.append(x)\n    return items\n\nprint(add(1))\nprint(add(2))',
    q: 'What does this Python code print?',
    o: ['[1] then [2]', '[1] then [1, 2]', '[1, 2] then [1, 2]', 'An error'], a: 1,
    e: 'Default arguments are evaluated once, when the function is defined, so both calls share the same list. So the code prints [1] then [1, 2]. Use items=None and create a new list inside instead.',
  },
  {
    id: 'cs_063', t: 'Programming', s: 'JavaScript', d: 'H',
    code: 'for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}',
    q: 'What does this JavaScript code print?',
    o: ['0 1 2', '3 3 3', '0 0 0', '2 2 2'], a: 1,
    e: 'var is function-scoped, so all three callbacks close over the same i. They run after the loop has finished, when i is 3 → "3 3 3". Using let (block-scoped) would print 0 1 2.',
  },
  {
    id: 'cs_064', t: 'Programming', s: 'Java', d: 'M',
    code: 'System.out.println(7 / 2 * 2.0);',
    q: 'What does this Java statement print?',
    o: ['7.0', '6.0', '7', '6'], a: 1,
    e: 'Evaluation is left to right: 7 / 2 is integer division → 3, then 3 * 2.0 → 6.0 (a double).',
    check: () => Math.trunc(7 / 2) * 2.0 === 6,
  },
  {
    id: 'cs_065', t: 'Programming', s: 'C++', d: 'M',
    code: 'int i = 0;\nwhile (i++ < 3)\n    cout << i << " ";',
    q: 'What does this C++ code print?',
    o: ['0 1 2', '1 2 3', '1 2 3 4', '0 1 2 3'], a: 1,
    e: 'i++ compares the old value, then increments. Checks: 0 < 3 (i becomes 1, print 1), 1 < 3 (print 2), 2 < 3 (print 3), 3 < 3 fails (i becomes 4). Output: "1 2 3".',
    check: () => {
      let i = 0;
      const out: number[] = [];
      while (i++ < 3) out.push(i);
      return out.join(' ') === '1 2 3';
    },
  },
  {
    id: 'cs_066', t: 'Programming', s: 'Python', d: 'E',
    code: 'print(type(5 / 2))',
    q: 'What does this Python 3 code print?',
    o: ["<class 'int'>", "<class 'float'>", "<class 'double'>", '2'], a: 1,
    e: 'In Python 3, / is true division and always returns a float (2.5), so this prints <class \'float\'>. Use // for integer floor division.',
  },
];

export default build('cs', rawCoreCs);
