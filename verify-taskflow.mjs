import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTests() {
  console.log('🚀 Starting TaskFlow Verification Tests (Sorting & Lavender Theme)...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // Monitor browser console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    // 1. Visit App
    console.log('1. Navigating to TaskFlow application...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

    const title = await page.title();
    console.log('   Page Title:', title);
    if (!title.includes('TaskFlow')) throw new Error('Title does not match TaskFlow');

    // 2. Verify Theme A Colors
    console.log('2. Verifying Lavender Theme A color variables...');
    const primaryColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    });
    console.log('   Active --primary CSS variable:', primaryColor);
    if (primaryColor.toUpperCase() !== '#7866B1') {
      throw new Error(`Expected --primary to be #7866B1, got ${primaryColor}`);
    }

    // 3. Verify Initial Tasks & Metrics
    console.log('3. Verifying initial tasks & summary metrics...');
    const taskCount = await page.$$eval('.task-item', items => items.length);
    console.log(`   Initial task count: ${taskCount}`);
    if (taskCount !== 4) throw new Error(`Expected 4 initial tasks, found ${taskCount}`);

    // Capture desktop dashboard screenshot with Theme A and Sort dropdown
    const screenshotDesktop = path.resolve(__dirname, 'screenshots', 'desktop-dashboard.png');
    await page.screenshot({ path: screenshotDesktop });
    console.log('   📸 Saved desktop dashboard screenshot to:', screenshotDesktop);

    // 4. Test All 6 Sorting Options
    console.log('4. Testing All 6 Sorting Options...');

    // A. Title: A to Z
    console.log('   -> Testing "Title: A to Z"...');
    await page.select('#task-sort-select', 'title-asc');
    await new Promise(r => setTimeout(r, 100));
    let titles = await page.$$eval('.task-item .task-title', els => els.map(e => e.textContent.trim()));
    console.log('      Titles (A-Z):', titles);
    for (let i = 0; i < titles.length - 1; i++) {
      if (titles[i].localeCompare(titles[i + 1]) > 0) {
        throw new Error(`Title A-Z order violated: "${titles[i]}" came before "${titles[i + 1]}"`);
      }
    }

    // B. Title: Z to A
    console.log('   -> Testing "Title: Z to A"...');
    await page.select('#task-sort-select', 'title-desc');
    await new Promise(r => setTimeout(r, 100));
    titles = await page.$$eval('.task-item .task-title', els => els.map(e => e.textContent.trim()));
    console.log('      Titles (Z-A):', titles);
    for (let i = 0; i < titles.length - 1; i++) {
      if (titles[i].localeCompare(titles[i + 1]) < 0) {
        throw new Error(`Title Z-A order violated: "${titles[i]}" came before "${titles[i + 1]}"`);
      }
    }

    // C. Priority: High to Low
    console.log('   -> Testing "Priority: High to Low"...');
    await page.select('#task-sort-select', 'priority-desc');
    await new Promise(r => setTimeout(r, 100));
    let priorities = await page.$$eval('.task-item .priority-badge', els => els.map(e => e.textContent.trim()));
    console.log('      Priorities (High to Low):', priorities);
    const weightMap = { 'High Priority': 3, 'Medium Priority': 2, 'Low Priority': 1 };
    for (let i = 0; i < priorities.length - 1; i++) {
      if (weightMap[priorities[i]] < weightMap[priorities[i + 1]]) {
        throw new Error(`Priority High to Low violated: ${priorities[i]} before ${priorities[i + 1]}`);
      }
    }

    // D. Priority: Low to High
    console.log('   -> Testing "Priority: Low to High"...');
    await page.select('#task-sort-select', 'priority-asc');
    await new Promise(r => setTimeout(r, 100));
    priorities = await page.$$eval('.task-item .priority-badge', els => els.map(e => e.textContent.trim()));
    console.log('      Priorities (Low to High):', priorities);
    for (let i = 0; i < priorities.length - 1; i++) {
      if (weightMap[priorities[i]] > weightMap[priorities[i + 1]]) {
        throw new Error(`Priority Low to High violated: ${priorities[i]} before ${priorities[i + 1]}`);
      }
    }

    // E. Oldest first
    console.log('   -> Testing "Oldest first"...');
    await page.select('#task-sort-select', 'oldest');
    await new Promise(r => setTimeout(r, 100));
    const firstOldestTitle = await page.$eval('.task-item:first-child .task-title', el => el.textContent.trim());
    console.log('      Oldest task at top:', firstOldestTitle);
    // Task 2 was created 48h ago, so it is the oldest
    if (firstOldestTitle !== 'Review JavaScript fundamentals') {
      throw new Error(`Expected oldest task to be "Review JavaScript fundamentals", got "${firstOldestTitle}"`);
    }

    // F. Newest first (default)
    console.log('   -> Testing "Newest first"...');
    await page.select('#task-sort-select', 'newest');
    await new Promise(r => setTimeout(r, 100));
    const firstNewestTitle = await page.$eval('.task-item:first-child .task-title', el => el.textContent.trim());
    console.log('      Newest task at top:', firstNewestTitle);
    // Task 4 was created 2h ago, so it is newest among initial tasks
    if (firstNewestTitle !== 'Test the dashboard responsive layouts') {
      throw new Error(`Expected newest task to be "Test the dashboard responsive layouts", got "${firstNewestTitle}"`);
    }

    // 5. Test Sorting Combined with Search and Status Filters
    console.log('5. Testing Sorting combined with Filter & Search...');
    // Filter to Pending
    await page.click('.sidebar-menu li:nth-child(2) button'); // Pending
    await new Promise(r => setTimeout(r, 100));
    // Sort Title A to Z
    await page.select('#task-sort-select', 'title-asc');
    await new Promise(r => setTimeout(r, 100));
    titles = await page.$$eval('.task-item .task-title', els => els.map(e => e.textContent.trim()));
    console.log('      Pending tasks sorted A-Z:', titles);
    if (titles[0] !== 'Prepare project documentation' || titles[1] !== 'Test the dashboard responsive layouts') {
      throw new Error('Sort combined with Pending filter did not order correctly');
    }

    // Add search "project"
    await page.type('.search-input', 'project');
    await new Promise(r => setTimeout(r, 100));
    const searchFilteredCount = await page.$$eval('.task-item', els => els.length);
    console.log(`      Search + Filter + Sort count: ${searchFilteredCount}`);
    if (searchFilteredCount !== 1) throw new Error('Search did not isolate single project task');

    // Capture search filter screenshot
    const screenshotSearch = path.resolve(__dirname, 'screenshots', 'search-filter.png');
    await page.screenshot({ path: screenshotSearch });
    console.log('   📸 Saved search/filter screenshot to:', screenshotSearch);

    // Clear search and reset filter
    await page.click('.search-clear-btn');
    await page.click('.sidebar-menu li:nth-child(1) button'); // All Tasks
    await page.select('#task-sort-select', 'newest');
    await new Promise(r => setTimeout(r, 100));

    // 6. Test Add Task Dialog with Theme A
    console.log('6. Testing Add Task dialog...');
    await page.click('.add-task-btn');
    await page.waitForSelector('.modal-card');

    const screenshotModal = path.resolve(__dirname, 'screenshots', 'task-modal.png');
    await page.screenshot({ path: screenshotModal });
    console.log('   📸 Saved task modal screenshot to:', screenshotModal);

    await page.type('#task-title', 'Verify sorting feature');
    await page.select('#task-priority', 'High');
    await page.select('#task-status', 'Pending');
    await page.click('.modal-actions .btn-primary');
    await page.waitForSelector('.modal-card', { hidden: true });

    const countAfterAdd = await page.$$eval('.task-item', items => items.length);
    console.log(`   Task count after add: ${countAfterAdd} (Expected: 5)`);
    if (countAfterAdd !== 5) throw new Error('Task count was not 5 after addition');

    // 7. Test Inline Status Change
    console.log('7. Testing Inline Status change...');
    await page.select('.task-item:first-child .task-status-select', 'Completed');
    await new Promise(r => setTimeout(r, 100));
    const completedBadge = await page.$eval('.card-completed .card-number', el => el.textContent.trim());
    console.log(`   Completed count after status change: ${completedBadge}`);
    if (completedBadge !== '2') throw new Error('Completed count did not update to 2');

    // 8. Test Edit Task
    console.log('8. Testing Edit Task...');
    await page.click('.task-item:first-child .btn-edit');
    await page.waitForSelector('.modal-card');
    await page.$eval('#task-title', el => el.value = '');
    await page.type('#task-title', 'Verify sorting feature (Updated)');
    await page.click('.modal-actions .btn-primary');
    await page.waitForSelector('.modal-card', { hidden: true });

    const editedTitle = await page.$eval('.task-item:first-child .task-title', el => el.textContent.trim());
    if (!editedTitle.includes('(Updated)')) throw new Error('Task title was not updated');

    // 9. Test Delete with Confirmation
    console.log('9. Testing Delete Task with Confirmation...');
    await page.click('.task-item:first-child .btn-delete');
    await page.waitForSelector('.modal-confirm-card');
    await page.click('.confirm-actions .btn-danger');
    await page.waitForSelector('.modal-confirm-card', { hidden: true });
    await new Promise(r => setTimeout(r, 100));

    const countAfterDelete = await page.$$eval('.task-item', items => items.length);
    console.log(`   Task count after delete: ${countAfterDelete} (Expected: 4)`);
    if (countAfterDelete !== 4) throw new Error('Task was not deleted');

    // 10. Test LocalStorage Persistence on Reload
    console.log('10. Testing page reload persistence...');
    await page.reload({ waitUntil: 'networkidle0' });
    const countAfterReload = await page.$$eval('.task-item', items => items.length);
    console.log(`    Task count after reload: ${countAfterReload} (Expected: 4)`);
    if (countAfterReload !== 4) throw new Error('Tasks did not persist after reload');

    // 11. Test Mobile Layout (375x812)
    console.log('11. Testing Mobile Viewport (375x812)...');
    await page.setViewport({ width: 375, height: 812 });
    await new Promise(r => setTimeout(r, 200));

    await page.click('.mobile-menu-btn');
    await new Promise(r => setTimeout(r, 300));

    const screenshotMobile = path.resolve(__dirname, 'screenshots', 'mobile-view.png');
    await page.screenshot({ path: screenshotMobile });
    console.log('    📸 Saved mobile view screenshot to:', screenshotMobile);

    await page.click('.sidebar-close-btn');
    await new Promise(r => setTimeout(r, 200));

    if (consoleErrors.length > 0) {
      console.warn('⚠️ Console errors detected:', consoleErrors);
    } else {
      console.log('✅ Zero console errors detected.');
    }

    console.log('\n🎉 ALL SORTING & LAVENDER THEME TESTS PASSED PERFECTLY!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runTests();
