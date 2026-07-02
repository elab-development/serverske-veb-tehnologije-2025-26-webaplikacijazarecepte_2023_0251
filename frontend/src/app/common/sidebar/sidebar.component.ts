import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SidebarItem {
  label: string;
  route: string;
  icon?: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() items: SidebarItem[] = [];
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Output() itemClick = new EventEmitter<SidebarItem>();
  @Output() toggleSidebar = new EventEmitter<boolean>();
  @Output() filterChange = new EventEmitter<{value: string, filterNumber: number}>();
  @Output() searchChange = new EventEmitter<string>();

  onItemClick(item: SidebarItem): void {
    if (!item.disabled) {
      this.itemClick.emit(item);
    }
  }

  onToggle(): void {
    this.isOpen = !this.isOpen;
    this.toggleSidebar.emit(this.isOpen);
  }

  onFilterChange(event: any, filterNumber: number): void {
    const value = event.target.value;
    console.log(`Filter ${filterNumber} changed to:`, value);
    this.filterChange.emit({ value, filterNumber });
  }

  onSearchChange(event: any): void {
    const searchTerm = event.target.value;
    console.log('Search term changed to:', searchTerm);
    this.searchChange.emit(searchTerm);
  }
}
