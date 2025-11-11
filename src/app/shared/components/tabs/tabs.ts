import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Tab {
  id: string;
  title: string;
  closable?: boolean;
}

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabs.html',
  styleUrls: ['./tabs.css']
})
export class TabsComponent {
  @Input() tabs: Tab[] = [];
  @Output() tabClosed = new EventEmitter<string>();
  @Output() tabSelected = new EventEmitter<string>();

  selectedTabId = signal<string | null>(null);

  ngOnInit() {
    if (this.tabs.length > 0 && !this.selectedTabId()) {
      this.selectTab(this.tabs[0].id);
    }
  }

  ngOnChanges() {
    if (this.tabs.length > 0 && !this.selectedTabId()) {
      this.selectTab(this.tabs[0].id);
    }
    
    const currentSelected = this.selectedTabId();
    if (currentSelected && !this.tabs.find(t => t.id === currentSelected)) {
      this.selectTab(this.tabs[0]?.id || null);
    }
  }

  selectTab(tabId: string | null) {
    this.selectedTabId.set(tabId);
    if (tabId) {
      this.tabSelected.emit(tabId);
    }
  }

  closeTab(tabId: string, event: Event) {
    event.stopPropagation();
    this.tabClosed.emit(tabId);
  }

  isSelected(tabId: string): boolean {
    return this.selectedTabId() === tabId;
  }
}